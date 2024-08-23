import {
  Box,
  Button,
  Container,
  Flex,
  useColorMode,
  useColorModeValue,
  Image,
  Tooltip,
} from "@chakra-ui/react";
import { IoMoon } from "react-icons/io5";
import { LuSun } from "react-icons/lu";
import CreateUserModal from "./CreateUserModal.jsx";
import PropTypes from "prop-types";
import { CurrentUserContext } from "../App.jsx";
import { useContext } from "react";

const Navbar = ({ setUsers, shareFriend }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const currentUser = useContext(CurrentUserContext);



  return (
    <Container maxW={"900px"}>
      <Box
        px={4}
        my={4}
        borderRadius={5}
        bg={useColorModeValue("gray.200", "gray.700")}
      >
        <Flex h="16" alignItems={"center"} justifyContent={"space-between"}>
          {/* Left side */}
          <Flex
            alignItems={"center"}
            justifyContent={"center"}
            gap={3}
            display={{ base: "none", sm: "flex" }}
          >
            <img src="/explode.png" alt="Explode head" width={45} height={45} />
          </Flex>
          {/* Right side */}
          <Flex gap={3} alignItems={"center"}>
            {currentUser && currentUser.pictureUrl && (
              <Tooltip
                label={`${currentUser.displayName}としてログイン中`}
                aria-label="A tooltip"
              >
                <Image
                  borderRadius="full"
                  boxSize="40px"
                  src={currentUser.pictureUrl}
                  alt={currentUser.displayName}
                />
              </Tooltip>
            )}

            <Button onClick={toggleColorMode}>
              {colorMode === "light" ? <IoMoon /> : <LuSun size={20} />}
            </Button>
            <CreateUserModal setUsers={setUsers} />
            <Button onClick={() => shareFriend()} bgColor="#06c755" color={"white"}>
              友だちに送る
            </Button>
          </Flex>
        </Flex>
      </Box>
    </Container>
  );
};

Navbar.propTypes = {
  setUsers: PropTypes.func,
  shareFriend: PropTypes.func,
};

export default Navbar;

