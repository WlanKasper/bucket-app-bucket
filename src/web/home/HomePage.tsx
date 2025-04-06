import { Box } from "@mui/material";
import style from "./styleHomePage";

import Header from "./Header";
import CatalogActionBar from "./CatalogActionBar";
import CatalogItemList from "./CatalogItemList";

const EventsPage = (): JSX.Element => {
  return (
    <Box sx={style.container}>
      <Header />
      <Box sx={style.content}>
        <CatalogActionBar />
        <CatalogItemList />
      </Box>
    </Box>
  );
};

export default EventsPage;
