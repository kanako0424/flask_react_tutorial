import { Container, Stack, Text } from "@chakra-ui/react";
import Navbar from './components/Navbar.jsx';
import UserGrid from "./components/UserGrid.jsx";
import { useState, useEffect, createContext, useCallback } from "react";
import liff from '@line/liff';
// import LIFFInspectorPlugin from '@line/liff-inspector';

export const CurrentUserContext = createContext();

// updated this after recording. Make sure you do the same so that it can work in production
export const BASE_URL = import.meta.env.MODE === "development" ? "http://127.0.0.1:5000/api" : "/api";

function App() {
	const [users, setUsers] = useState([]);
	const [currentUser, setCurrentUser] = useState(null);

	const initializeLiff = useCallback(async () => {
		try {
			// liff.use(new LIFFInspectorPlugin());
			await liff.init({
				liffId: '2006014570-D3ZRz2q1', // Use your own liffId
				withLoginOnExternalBrowser: true,
			});
			if (!liff.isLoggedIn()) {
				liff.login({ redirectUri: location.href });
			} else {
				console.log('User is logged in');
			}
		} catch (error) {
			console.error('LIFF initialization failed', error);
		}
	}, []);

	const getUserInfo = useCallback(async () => {

		const idToken = liff.getIDToken();
		if (!idToken) {
			console.error('ID Token is null or undefined');
			return;
		} 

		try {
			const response = await fetch(`${BASE_URL}/verify`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ idToken }),
			});
			const profile = await response.json();
			setCurrentUser({
				userId: profile.sub,
				displayName: profile.name,
				pictureUrl: profile.picture,
			});

		} catch (error) {
			console.error('Failed to get user info', error);
		} 
	}, []);

	useEffect(() => {
		const init = async () => {
			await initializeLiff();
			if (liff.isLoggedIn()) {
				await getUserInfo();
			} else {
				console.error("liff is not logged in");
			}
		};

		init();

		// console.log(currentUser);

	}, []); // Dependency array is empty, which is appropriate for this use case.

	return (
		<CurrentUserContext.Provider value={currentUser}>
			<Stack minH={"100vh"} pb={9} pr={5} pl={5}>
				<Navbar setUsers={setUsers} />

				<Container maxW={"1200px"} my={4}>
					<Text
						fontSize={{ base: "3xl", md: "50" }}
						fontWeight={"bold"}
						letterSpacing={"2px"}
						textTransform={"uppercase"}
						textAlign={"center"}
						mb={8}
					>
						<Text as={"span"} bgGradient={"linear(to-r, cyan.400, blue.500)"} bgClip={"text"}>
							私の友達
						</Text>
						🚀
					</Text>

					<UserGrid users={users} setUsers={setUsers} currentUser={currentUser} />
				</Container>
			</Stack>
		</CurrentUserContext.Provider>
	);
}

export default App;
