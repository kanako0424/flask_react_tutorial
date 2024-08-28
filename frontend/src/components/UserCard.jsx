import {
  Avatar,
  Box,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  IconButton,
  Text,
  useToast,
} from "@chakra-ui/react";
import { BiTrash } from "react-icons/bi";
import EditModal from "./EditModal.jsx";
import { BASE_URL, CurrentUserContext } from "../App.jsx";
import PropTypes from "prop-types";
import { useContext } from "react";

const UserCard = ({ user, setUsers }) => {
  const currentUser = useContext(CurrentUserContext);

  const toast = useToast();
  const handleDeleteUser = async () => {
    if (window.confirm("カードを削除しますよ？！")) {
      try {
        const res = await fetch(BASE_URL + "/friends/" + user.id, {
          method: "DELETE",
        });
        const reData = await res.json();
        if (!res.ok) {
          throw new Error(reData.error);
        }
        setUsers((prevUsers) => prevUsers.filter((u) => u.id !== user.id));
        toast({
          status: "success",
          title: "Success",
          description: "友達情報が削除されました！",
          duration: 2000,
          position: "top-center",
        });
      } catch (error) {
        toast({
          title: "友達情報の削除中にエラーが起きました",
          description: error.message,
          status: "error",
          duration: 4000,
          isClosable: true,
          position: "top-center",
        });
      }
    }
  };
  return (
    <Card>
      <CardHeader>
        <Flex gap={4}>
          <Flex flex={"1"} gap={"4"} alignItems={"center"}>
            <Avatar src={user.imgUrl} />

            <Box>
              <Heading size="sm">{user.name}</Heading>
              <Text>{user.role}</Text>
            </Box>
          </Flex>

          {currentUser && currentUser.userId === user.creatorId && (
            <Flex>
              <EditModal user={user} setUsers={setUsers} />
              <IconButton
                variant="ghost"
                colorScheme="red"
                size={"sm"}
                aria-label="See menu"
                icon={<BiTrash size={20} />}
                onClick={handleDeleteUser}
              />
            </Flex>
          )}
        </Flex>
      </CardHeader>

      <CardBody>
        <Text>{user.description}</Text>
      </CardBody>
    </Card>
  );
};

UserCard.propTypes = {
  setUsers: PropTypes.func.isRequired,
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    imgUrl: PropTypes.string,
    name: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    creatorId: PropTypes.string,
  }).isRequired,
};

export default UserCard;
