import { useState, useEffect, useContext, useRef } from "react";
import { LineraContext } from "../../context/SocketContext";
import styles from "./styles.module.css";

const LeaderboardModal = ({ isOpen, onClose }) => {
  const { lineraClient, startLeaderboardMonitoring, stopLeaderboardMonitoring } = useContext(LineraContext);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const isMounted = useRef(true);

  // Function to fetch leaderboard data
  const fetchLeaderboard = async () => {
    if (!lineraClient || !isMounted.current) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      const query = `
        query {
          globalLeaderboard {
            chainId
            totalGames
            wins
            losses
          }
        }
      `;
      
      const response = await lineraClient.makeGraphQLRequest(
        lineraClient.getReadChainEndpoint(),
        query
      );
      
      if (response.errors) {
        throw new Error(response.errors[0].message);
      }
      
      if (isMounted.current) {
        setLeaderboard(response.data.globalLeaderboard || []);
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
      if (isMounted.current) {
        setError("Failed to fetch leaderboard: " + err.message);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  // Fetch leaderboard when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen]);

  // Setup leaderboard monitoring
  useEffect(() => {
    isMounted.current = true;
    
    if (isOpen && lineraClient) {
      // Start monitoring for blockchain notifications
      const setupMonitoring = async () => {
        try {
          await startLeaderboardMonitoring(() => {
            // When a blockchain notification is received, refresh the leaderboard
            if (isMounted.current) {
              fetchLeaderboard();
            }
          });
        } catch (err) {
          console.error("Failed to setup leaderboard monitoring:", err);
          if (isMounted.current) {
            setError("Failed to setup real-time updates: " + err.message);
          }
        }
      };
      
      setupMonitoring();
    }
    
    // Cleanup function
    return () => {
      isMounted.current = false;
      if (isOpen) {
        stopLeaderboardMonitoring();
      }
    };
  }, [isOpen, lineraClient]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Global Leaderboard</h2>
        
        <div className={styles.refreshContainer}>
          <button 
            className={styles.refreshButton} 
            onClick={fetchLeaderboard}
            disabled={isLoading}
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        
        {error && <div className={styles.error}>{error}</div>}
        
        {isLoading && leaderboard.length === 0 ? (
          <div className={styles.loading}>Loading leaderboard...</div>
        ) : (
          <div className={styles.leaderboardContainer}>
            <table className={styles.leaderboardTable}>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Chain ID</th>
                  <th>Games</th>
                  <th>Wins</th>
                  <th>Losses</th>
                  <th>Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard
                  .sort((a, b) => b.wins - a.wins || a.losses - b.losses)
                  .map((player, index) => {
                    const winRate = player.totalGames > 0 
                      ? ((player.wins / player.totalGames) * 100).toFixed(1) 
                      : "0.0";
                    
                    return (
                      <tr key={player.chainId}>
                        <td>{index + 1}</td>
                        <td className={styles.chainId}>
                          {player.chainId.substring(0, 8)}...
                        </td>
                        <td>{player.totalGames}</td>
                        <td>{player.wins}</td>
                        <td>{player.losses}</td>
                        <td>{winRate}%</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
        
        <button className={styles.closeButton} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default LeaderboardModal;