import { createStyles, Text, Button } from "@mantine/core";

const useStyles = createStyles((theme) => ({
  modalButtonsContainer: {
    display: "flex",
    width: "100%",
    justifyContent: "center",
    gap: theme.spacing.xl,
  },
}));

const RefreshModal = ({
  setIsModalOpen,
  getFacilities,
}: {
  setIsModalOpen: (isModalOpen: boolean) => void;
  getFacilities: () => void;
}) => {
  const { classes } = useStyles();

  return (
    <>
      <Text>
        Are you sure you want to refresh this page? Any unplished changes will
        be lost
      </Text>
      <div className={classes.modalButtonsContainer}>
        <Button
          onClick={() => setIsModalOpen(false)}
          color="gray"
          variant="outline"
          style={{ marginTop: 16 }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            setIsModalOpen(false);
            getFacilities();
          }}
          color="green"
          variant="outline"
          style={{ marginTop: 16 }}
        >
          Refresh
        </Button>
      </div>
    </>
  );
};

export default RefreshModal;
