import { SxProps, Theme } from "@mui/material";
import background from "@/assets/background.svg";

const container: SxProps<Theme> = {
  position: "relative",

  height: "100%",

  paddingTop: "3vh",
  paddingLeft: "10vw",
  paddingRight: "10vw",
  paddingBottom: "3vh",

  display: "flex",
  flexDirection: "column",
  gap: "32px",

  background: `url(${background}) no-repeat center center`,
  backgroundSize: "cover",

  "@media (max-width: 600px)": {
    gap: "48px",
    paddingLeft: "5vw",
    paddingRight: "5vw",
  },
};

const status: SxProps<Theme> = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
};

const info: SxProps<Theme> = {
  display: "flex",
  flexDirection: "row",
  gap: "16px",
};

const statusInfo: SxProps<Theme> = {
  position: "relative",
  display: "flex",
};

const catalogInfo: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
};

const innerChart: SxProps<Theme> = {
  position: "absolute",
  top: "50%",
  left: "50%",

  display: "flex",
  flexDirection: "column",
  alignItems: "center",

  transform: "translate(-50%, -50%)",
};

const content: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: "24px",
};

const bar: SxProps<Theme> = {
  display: "flex",
  flexDirection: "row",
  gap: "16px",
};

const barCatalogs: SxProps<Theme> = {
  display: "flex",
  flexDirection: "row",
  gap: "16px",
  scrollbarWidth: "none",
  overflowX: "scroll",
};

const buttonAdd: SxProps<Theme> = {
  display: "flex",

  width: "44px",
  height: "44px",

  borderRadius: "15px",

  background: "#A694FF",
};

const buttonCatalog = (isActive: boolean): SxProps<Theme> => ({
  display: "flex",

  height: "44px",
  minWidth: "120px",
  whiteSpace: "nowrap",

  padding: "16px 24px",
  margin: "0",
  borderRadius: "15px",

  border: isActive ? "none" : "1px solid #A37BF5",

  background: isActive ? "#A37BF5" : "#FFFFFF",
  color: isActive ? "#FFFFFF" : "#A37BF5",
});

const list: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",

  padding: "20px",
  borderRadius: "15px",

  backgroundColor: "#ffffff",
};

const item: SxProps<Theme> = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
};

const extraItem: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  padding: "20px 0 0 0",

  fontSize: "12px",
  color: "#a8a8a8",

  cursor: "pointer",
};

const checkbox: SxProps<Theme> = {
  display: "flex",
  flexDirection: "row",

  size: "20px",
  padding: 0,

  color: "#A37BF5",
  borderRadius: "4px",

  "&.Mui-checked": {
    color: "#A37BF5",
  },
};

const textField: SxProps<Theme> = {
  background: "#ffffff",
  margin: 0,
};

const avatar: SxProps<Theme> = {
  width: "64px",
  height: "64px",
  border: "2px solid #A694FF",
  background: "#D3E2FE",
  color: "#FFFFFF",
};

const actionButtonCreate: SxProps<Theme> = {
  width: "100%",
  height: "44px",
  background: "transparent",
  color: "#A694FF",
};

const dialogTextField: SxProps<Theme> = {
  width: "100%",
  border: "1px solid #ACACAC",
  // borderRadius: "15px",
  background: "transparent",
};

export default {
  container,
  status,
  statusInfo,
  innerChart,
  content,
  info,
  bar,
  barCatalogs,
  buttonAdd,
  catalogInfo,
  buttonCatalog,
  list,
  item,
  extraItem,
  checkbox,
  textField,
  avatar,
  actionButtonCreate,
  dialogTextField,
};
