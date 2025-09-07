import { useContext, useState } from "react";
import { LineraContext } from "../../context/SocketContext";
import Button from "../../components/Button";
import RoomModal from "../../components/RoomModal";
import LeaderboardModal from "../../components/LeaderboardModal";
import logo_img from "../../images/logo.png";
import scissors_right_hand_img from "../../images/scissors_right_hand.png";
import rock_left_hand_img from "../../images/rock_left_hand.png";
import styles from "./styles.module.css";

const Home = () => {
  const { playerChainId } = useContext(LineraContext);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState(false);

  // Function to handle play with friend button click
  const handlePlayWithFriend = () => {
    setIsRoomModalOpen(true);
  };

  // Function to handle leaderboard button click
  const handleLeaderboardClick = () => {
    setIsLeaderboardModalOpen(true);
  };

  // Function to close room modal
  const closeRoomModal = () => {
    setIsRoomModalOpen(false);
  };

  // Function to close leaderboard modal
  const closeLeaderboardModal = () => {
    setIsLeaderboardModalOpen(false);
  };

  return (
    <>
      <div className={styles.left}>
        <img src={logo_img} alt="logo" className={styles.logo} />
        {/* Move play with friend button under the logo */}
        <div className={styles.logoButtonContainer}>
          <Button name="play with friend" onClick={handlePlayWithFriend} />
        </div>
      </div>
      <div className={styles.right}>
        <img
          src={scissors_right_hand_img}
          alt="paper_hand"
          className={styles.paper_hand}
        />
        <img
          src={rock_left_hand_img}
          alt="rock_hand"
          className={styles.rock_hand}
        />
        <div className={styles.btn_container}>
          {/* Remove play with friend from here and keep only other buttons */}
          <Button name="Play with stranger" type="stranger" />
          <Button name="Leaderboard" onClick={handleLeaderboardClick} />
        </div>
      </div>
      {/* Display player chain ID in top left corner */}
      {playerChainId && (
        <div className={styles.playerChainId}>
          Chain ID: {playerChainId.substring(0, 8)}...
        </div>
      )}
      
      {/* Room Modal */}
      <RoomModal isOpen={isRoomModalOpen} onClose={closeRoomModal} />
      
      {/* Leaderboard Modal */}
      <LeaderboardModal 
        isOpen={isLeaderboardModalOpen} 
        onClose={closeLeaderboardModal} 
      />
    </>
  );
};

export default Home;