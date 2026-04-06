import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import background from "@/assets/background.svg";

const StartPage = (): JSX.Element => {
  const navigate = useNavigate();

  const handleStart = () => {
    localStorage.setItem("onboarded", "true");
    navigate("/home");
  };

  return (
    <Box sx={styles.container}>
      <Box sx={styles.content}>
        <Box sx={styles.logoContainer}>
          <Box sx={styles.logo}>
            <Typography sx={styles.logoText}>B</Typography>
          </Box>
        </Box>

        <Box sx={styles.textContainer}>
          <Typography sx={styles.title}>Bucket</Typography>
          <Typography sx={styles.subtitle}>
            Organize your tasks into buckets.
            <br />
            Stay productive, stay focused.
          </Typography>
        </Box>

        <Button sx={styles.button} onClick={handleStart}>
          Get Started
        </Button>
      </Box>
    </Box>
  );
};

const styles = {
  container: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: `url(${background}) no-repeat center center`,
    backgroundSize: "cover",
    padding: "24px",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "40px",
    maxWidth: "320px",
    textAlign: "center",
  },
  logoContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: "120px",
    height: "120px",
    borderRadius: "30px",
    backgroundColor: "#A37BF5",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 8px 32px rgba(163, 123, 245, 0.3)",
  },
  logoText: {
    fontSize: "64px",
    fontWeight: 700,
    color: "#FFFFFF",
  },
  textContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  title: {
    fontSize: "32px",
    fontWeight: 700,
    color: "#333333",
  },
  subtitle: {
    fontSize: "16px",
    fontWeight: 400,
    color: "#666666",
    lineHeight: 1.5,
  },
  button: {
    width: "100%",
    height: "56px",
    borderRadius: "15px",
    backgroundColor: "#A37BF5",
    color: "#FFFFFF",
    fontSize: "18px",
    fontWeight: 600,
    textTransform: "none",
    "&:hover": {
      backgroundColor: "#9066E8",
    },
  },
};

export default StartPage;
