import { Container, Stack, Text } from "@chakra-ui/react";
import Navbar from './components/Navbar.jsx';
import UserGrid from "./components/UserGrid.jsx";
import { useState, useEffect, createContext } from "react";
import liff from '@line/liff';
// import { LiffMockPlugin } from '@line/liff-mock';
import LIFFInspectorPlugin from '@line/liff-inspector';




export const CurrentUserContext = createContext();

// updated this after recording. Make sure you do the same so that it can work in production
export const BASE_URL = import.meta.env.MODE === "development" ? "http://127.0.0.1:5000/api" : "/api";

function App() {
	const [users, setUsers] = useState([]);
	const [currentUser, setCurrentUser] = useState(null);

	useEffect(() => {
		const initializeLiff = async () => {
			try {
				// liff.use(new LiffMockPlugin());
				liff.use(new LIFFInspectorPlugin());
				await liff.init({
					liffId: '2005976312-NqAkEXnX', // Use your own liffId
					withLoginOnExternalBrowser: true,
					// mock: true,
				});			  
				if (!liff.isLoggedIn()) {
					liff.login();
					const profile = await liff.getProfile();
					setCurrentUser({
						userId: profile.userId,
						displayName: profile.displayName,
						pictureUrl: profile.pictureUrl,
					});
					console.log(currentUser)
					
				} else {
					console.log('User is logged in');
				}
			} catch (error) {
				console.error('LIFF initialization failed', error);
			}
		};	
		
		initializeLiff();
	}, [])
	

	return (
		<CurrentUserContext.Provider value={currentUser}>
			<Stack minH={"100vh"}>
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
							My Besties
						</Text>
						🚀
					</Text>

					<UserGrid users={users} setUsers={setUsers} />
				</Container>
			</Stack>
		</CurrentUserContext.Provider>

	);
}

export default App;