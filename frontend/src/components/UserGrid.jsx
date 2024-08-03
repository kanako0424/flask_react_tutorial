import { Flex, Grid, Spinner, Text } from "@chakra-ui/react";
import PropTypes from 'prop-types';
import UserCard from "./UserCard.jsx";
import { useEffect, useState } from "react";
import { BASE_URL } from "../App.jsx";

const UserGrid = ({ users, setUsers }) => {
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const getUsers = async () => {
			try {
				const res = await fetch(BASE_URL+'/friends', {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*',
					},
				});
				const resData = await res.json();

				if (!res.ok) {
					throw new Error(resData.error);
				}
				setUsers(resData);
			} catch (error) {
				console.error(error);
			} finally {
				setIsLoading(false);
			}
		};
		getUsers();
	}, [setUsers]);

	return (
		<>
			<Grid
				templateColumns={{
					base: "1fr",
					md: "repeat(2, 1fr)",
					lg: "repeat(3, 1fr)",
				}}
				gap={4}
			>
				{users.map((user) => (
					<UserCard key={user.id} user={user} setUsers={setUsers} />
				))}
			</Grid>

			{isLoading && (
				<Flex justifyContent={"center"}>
					<Spinner size={"xl"} />
				</Flex>
			)}
			{!isLoading && users.length === 0 && (
				<Flex justifyContent={"center"}>
					<Text fontSize={"xl"}>
						<Text as={"span"} fontSize={"2xl"} fontWeight={"bold"} mr={2}>
							Poor you! 🥺
						</Text>
						No friends found.
					</Text>
				</Flex>
			)}
		</>
	);
};

UserGrid.propTypes = {
	users: PropTypes.arrayOf(
	PropTypes.shape({
		id: PropTypes.number.isRequired,
		creatorId: PropTypes.string,
		name: PropTypes.string,
		role: PropTypes.string,
		description: PropTypes.string,
	})),
	setUsers: PropTypes.func,
	isLoading: PropTypes.bool,
  };


export default UserGrid;