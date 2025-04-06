import { createTheme, formLabelClasses } from "@mui/material";
import { grey } from "@mui/material/colors";
import montserratBlack from "./fonts/Montserrat-Black.ttf";
import montserratExtraBold from "./fonts/Montserrat-ExtraBold.ttf";
import montserratBold from "./fonts/Montserrat-Bold.ttf";
import montserratSemiBold from "./fonts/Montserrat-SemiBold.ttf";
import montserratRegular from "./fonts/Montserrat-Regular.ttf";
import montserratMedium from "./fonts/Montserrat-Medium.ttf";
import montserratLight from "./fonts/Montserrat-Light.ttf";
import montserratExtraLight from "./fonts/Montserrat-ExtraLight.ttf";
import montserratThin from "./fonts/Montserrat-Thin.ttf";
import { colors } from "./colors";

const mainTheme = createTheme({
  palette: {
    text: {
      primary: colors.primary,
      secondary: colors.black,
      disabled: "#52575c",
    },
    primary: {
      main: "#25282b",
      light: "#747779",
      dark: "#3F4144",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#e1e1e1",
      light: "#a0a4a8",
      dark: "#9f9f9f",
      contrastText: "#25282b",
    },
    error: {
      main: "#fb4e4e",
      dark: "#e93c3c",
      light: "#ff6262",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#f6a609",
      dark: "#e89806",
      light: "#ffbc1f",
      contrastText: "#ffffff",
    },
    info: {
      main: "#0288D1",
      dark: "#01579B",
      light: "#c0eaff",
      contrastText: "#ffffff",
    },
    success: {
      main: "#2ac769",
      dark: "#1ab759",
      light: "#40dd7f",
      contrastText: "#ffffff",
    },
    background: {
      paper: grey[50],
      default: "#e8e8e8",
    },
  },
  typography: {
    fontFamily: "Montserrat, Helvetica, Arial, sans-serif",
    htmlFontSize: 16, // mui default
    fontSize: 14, // mui default
    fontWeightLight: 300, // mui default
    fontWeightRegular: 400, // mui default
    fontWeightBold: 700, // mui default
    fontWeightMedium: 500,
    allVariants: {
      fontStyle: "normal",
    },
    h1: {
      fontWeight: 700,
      fontSize: "42px",
      "@media (max-width: 600px)": {
        fontSize: "28px",
      },
    },
    h2: {
      fontWeight: 700,
      fontSize: "42px",
      "@media (max-width: 600px)": {
        fontSize: "32px",
      },
    },
    h3: {
      fontWeight: 700,
      fontSize: "34px",
      "@media (max-width: 600px)": {
        fontSize: "28px",
      },
    },
    h4: {
      fontWeight: 700,
      fontSize: "24px",
      "@media (max-width: 600px)": {
        fontSize: "20px",
      },
    },
    h5: {
      fontWeight: 700,
      fontSize: "20px",
      "@media (max-width: 600px)": {
        fontSize: "18px",
      },
    },
    h6: {
      fontWeight: 700,
      fontSize: "16px",
      "@media (max-width: 600px)": {
        fontSize: "14px",
      },
    },
  },
  transitions: {
    duration: {
      enteringScreen: 300,
      leavingScreen: 250,
    },
  },
});

const componentOverride = createTheme(mainTheme, {
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        :root {
          font-synthesis: none;
          text-rendering: optimizeLegibility;
        }
        html, body{
          height: 100%;
        }
        body{
          overflow: hidden;
        }
        #root {
          width: 100%;
          height: 100%;
        }
        @font-face {
          font-family: 'Montserrat';
          font-weight: 900;
          src: url(${montserratBlack}) format('truetype');
        }
        @font-face {
          font-family: 'Montserrat';
          font-weight: 800;
          src: url(${montserratExtraBold}) format('truetype');
        }
        @font-face {
          font-family: 'Montserrat';
          font-weight: 600;
          src: url(${montserratBold}) format('truetype');
        }
        @font-face {
          font-family: 'Montserrat';
          font-weight: 550;
          src: url(${montserratSemiBold}) format('truetype');
        }
        @font-face {
          font-family: 'Montserrat';
          font-weight: 500;
          src: url(${montserratMedium}) format('truetype');
        }
        @font-face {
          font-family: 'Montserrat';
          font-weight: 400;
          src: url(${montserratRegular}) format('truetype');
        }
        @font-face {
          font-family: 'Montserrat';
          font-weight: 300;
          src: url(${montserratLight}) format('truetype');
        }
        @font-face {
          font-family: 'Montserrat';
          font-weight: 200;
          src: url(${montserratExtraLight}) format('truetype');
        }
        @font-face {
          font-family: 'Montserrat';
          font-weight: 100;
          src: url(${montserratThin}) format('truetype');
        }
      `,
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          padding: "5px 30px",
          minWidth: "auto",

          // "&:hover": {
          //   backgroundColor: "inherit",
          // },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        container: {
          height: "auto",
          paddingTop: "10vh",
        },
        paper: {
          borderRadius: "16px",
          background: "#FFFFFF",
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          margin: 0,
          padding: 0,
          borderTop: "1px solid #666666",
        },
      },
    },
    MuiInput: {
      styleOverrides: {
        root: {
          ...mainTheme.typography.body2,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          ...mainTheme.typography.body2,

          "&.MuiInputLabel-root": {
            transform: "translate(14px, 12px) scale(1)",
          },
          "&.MuiInputLabel-shrink": {
            transform: "translate(14px, -8px)  scale(0.8)",
            "&.MuiInputLabel-sizeSmall": {
              transform: "translate(14px, -8px)  scale(0.8)",
            },
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: "8px",

          "& .MuiInputBase-root": {
            borderRadius: "16px",
            background: "none",

            ".MuiInputBase-input": {
              color: "#333333",
            },
          },
        },
      },
      defaultProps: {
        variant: "standard",
        size: "small",
        fullWidth: true,
        margin: "dense",
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          "& .MuiInputBase-root": {
            borderRadius: "16px",
            background: "#141414",

            ".MuiInputBase-input": {
              padding: "12px 14px",
            },
          },
          "& .MuiInputBase-root:before": {
            border: 0,
          },
          "& .MuiInputBase-root:not(.Mui-disabled, .Mui-error):hover:before": {
            border: 0,
          },
          "& .MuiInputBase-root:after": {
            border: 0,
          },
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              border: 0,
            },
            "&:hover fieldset": {
              border: 0,
            },
            "&.Mui-focused fieldset": {
              border: 0,
            },
          },
        },
      },
    },
    MuiDateTimePickerToolbarText: {
      styleOverrides: {
        root: {
          fontWeight: 900,
        },
      },
    },
    MuiPickersLayout: {
      styleOverrides: {
        root: {
          ".MuiPickersLayout-actionBar": {
            columnGap: "8px",
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        root: {
          width: "max-content",
          flexShrink: 0,
          whiteSpace: "nowrap",
          boxSizing: "border-box",
          "& .MuiDrawer-paper": {
            backgroundColor: mainTheme.palette.secondary,
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          textDecoration: "none",
        },
      },
    },
    MuiPopper: {
      styleOverrides: {
        root: {
          "@media (max-height: 800px)": {
            marginTop: "-25vh !important",
          },
        },
      },
    },
  },
});

export const theme = createTheme(mainTheme, componentOverride);
