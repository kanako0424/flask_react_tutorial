import { Container, Stack, Text } from "@chakra-ui/react";
import Navbar from "./components/Navbar.jsx";
import UserGrid from "./components/UserGrid.jsx";
import { useState, useEffect, createContext, useCallback } from "react";
import liff from "@line/liff";
import LIFFInspectorPlugin from "@line/liff-inspector";

export const CurrentUserContext = createContext();

export const BASE_URL =
  import.meta.env.MODE === "development" ? "http://127.0.0.1:5000/api" : "/api";

function App() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const initializeLiff = useCallback(async () => {
    try {
      liff.use(new LIFFInspectorPlugin());
      await liff.init({
        liffId: "2005976312-NqAkEXnX", // Use your own liffId
        withLoginOnExternalBrowser: true,
      });
      if (!liff.isLoggedIn()) {
        liff.login({ redirectUri: window.location.href });
      } else {
        console.log("User is logged in");
      }
    } catch (error) {
      console.error("LIFF initialization failed", error);
    }
  }, []);

  const login_to_myfre = useCallback(async (userId) => {
    // Send userId to the backend to register the user
    const liffAccessToken = liff.getAccessToken();
    if (!liffAccessToken) {
      throw new Error("LIFF Access Token is null or undefined");
    }
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: userId, liffAccessToken }),
    });
    const login_message = await response.json();
    console.log(login_message);
  }, []);

  const getUserInfo = useCallback(async () => {
    const idToken = liff.getIDToken();
    if (!idToken) {
      console.error("ID Token is null or undefined");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });
      const profile = await response.json();
      setCurrentUser({
        userId: profile.sub,
        displayName: profile.name,
        pictureUrl: profile.picture,
      });
      login_to_myfre(profile.sub);
    } catch (error) {
      console.error("Failed to get user info", error);
    }
  }, []);

  const shareFriend = () => {
    if (liff.isApiAvailable("shareTargetPicker")) {
      liff
        .shareTargetPicker(
          [
            {
              type: "flex",
              altText: "Flex Message",
              contents: {
                type: "bubble",
                body: {
                  type: "box",
                  layout: "vertical",
                  spacing: "0px",
                  contents: [
                    {
                      type: "text",
                      text: `${currentUser.displayName}がマイフレに招待しています`,
                      size: "xl",
                      gravity: "center",
                      weight: "bold",
                      wrap: true,
                    },
                    {
                      type: "box",
                      layout: "vertical",
                      spacing: "sm",
                      margin: "lg",
                      contents: [
                        {
                          type: "image",
                          url: "https://my-friend-j1c9.onrender.com/explode.png",
                          aspectMode: "cover",
                          animated: true,
                          align: "center",
                          gravity: "center",
                          size: "60%",
                        },
                      ],
                    },
                  ],
                },
                footer: {
                  type: "box",
                  layout: "vertical",
                  spacing: "sm",
                  contents: [
                    {
                      type: "button",
                      style: "link",
                      height: "sm",
                      action: {
                        type: "uri",
                        label: "使ってみる",
                        uri: "https://liff.line.me/2006014570-D3ZRz2q1",
                      },
                    },
                    {
                      type: "box",
                      layout: "vertical",
                      contents: [],
                      margin: "sm",
                    },
                  ],
                  flex: 0,
                },
              },
            },
          ],
          {
            isMultiple: true,
          }
        )
        .then(function (res) {
          if (res) {
            console.log(`[${res.status}] Message sent!`);
          } else {
            console.log("TargetPicker was closed!");
          }
        })
        .catch(function (error) {
          console.log("something wrong happen", error);
        });
    } else {
      console.log("not availabel");
    }
  };

  const getPermission = () => {
    liff.permission.query("profile").then((permissionStatus) => {
      if (permissionStatus.state === "prompt") {
        liff.permission.requestAll();
      }
    });
  };

  useEffect(() => {
    const init = async () => {
      await initializeLiff();
      if (liff.isLoggedIn()) {
        await getUserInfo();
      } else {
        console.error("liff is not logged in");
      }
      getPermission();
    };
    init();
  }, []);

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <Stack minH={"100vh"} pb={9} pr={5} pl={5}>
        <Navbar setUsers={setUsers} shareFriend={shareFriend} />

        <Container maxW={"1200px"} my={4}>
          <Text
            fontSize={{ base: "3xl", md: "50" }}
            fontWeight={"bold"}
            letterSpacing={"2px"}
            textTransform={"uppercase"}
            textAlign={"center"}
            mb={8}
          >
            <Text
              as={"span"}
              bgGradient={"linear(to-r, cyan.400, blue.500)"}
              bgClip={"text"}
            >
              私の友達
            </Text>
            🚀
          </Text>

          <UserGrid
            users={users}
            setUsers={setUsers}
            currentUser={currentUser}
          />
        </Container>
      </Stack>
    </CurrentUserContext.Provider>
  );
}

export default App;
