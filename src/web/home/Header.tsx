import { Box, Typography, Avatar } from "@mui/material";
import { PieChart } from "@mui/x-charts";
import style from "./styleHomePage";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDispatch, useSelector } from "react-redux";
import { bucketActions, bucketSelectors } from "@/store/bucket";
import { getTelegramUser } from "@/helpers/telegram/utils";

const Header = (): JSX.Element => {
  const dispatch = useDispatch();
  const catalog = useSelector(bucketSelectors.selectedBucket);

  const user = getTelegramUser();

  const data =
    catalog && catalog.data.length > 0
      ? catalog.data.map((item) => ({
          id: item.id,
          value: 1,
          color: item.isChecked ? "#A37BF5" : "#FFFFFF",
        }))
      : [{ id: 0, value: 1, color: "#FFFFFF" }];

  const handleDeleteCatalog = () => {
    if (!catalog) return;
    dispatch(bucketActions.sagaDeleteBucketById(catalog._id));
  };

  return (
    <Box sx={style.status}>
      <Box sx={style.info}>
        <Box sx={style.statusInfo}>
          <PieChart
            series={[
              {
                data,
                innerRadius: 28,
                outerRadius: 32,
                paddingAngle: 0,
                cornerRadius: 10,
                startAngle: 0,
                endAngle: 360,
                cx: 27,
                cy: 27,
              },
            ]}
            width={64}
            height={64}
          />
          <Box sx={style.innerChart}>
            <Typography
              fontSize={10}
              fontWeight={400}
              color={"#666666"}
              lineHeight={0.6}
            >
              Status
            </Typography>
            <Typography
              fontSize={12}
              fontWeight={600}
              color={"#666666"}
              sx={{ whiteSpace: "nowrap" }}
            >
              {catalog
                ? `${catalog.data.filter((item) => item.isChecked).length} of ${catalog.data.length}`
                : ""}
            </Typography>
          </Box>
        </Box>
        {catalog && (
          <Box sx={style.catalogInfo}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: "6px",
                alignItems: "center",
                color: "#ACACAC",
              }}
            >
              <Typography fontSize={18} fontWeight={700} color={"#666666"}>
                {catalog.name}
              </Typography>
              <DeleteIcon onClick={handleDeleteCatalog} />
            </Box>
            <Typography fontSize={12} fontWeight={400} color={"#ACACAC"}>
              {catalog.description}
            </Typography>
          </Box>
        )}
      </Box>

      <Box>
        <Avatar
          sx={style.avatar}
          alt={user?.first_name}
          src={user?.photo_url || undefined}
        >
          {user?.first_name?.[0] || "?"}
        </Avatar>
      </Box>
    </Box>
  );
};

export default Header;
