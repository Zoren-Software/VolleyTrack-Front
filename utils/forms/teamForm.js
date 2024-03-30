export function transformTeamData(team) {
  return {
    id: team.id,
    name: team.name,
    users: team.players.map((user) => {
      return {
        id: Number(user.id),
        user: user
      };
    }),
  };
}