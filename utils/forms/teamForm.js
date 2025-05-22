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
    teamCategory: {
      id: Number(team.teamCategoryId),
      text: team.teamCategory.name,
    },
    teamLevel: {
      id: Number(team.teamLevelId),
      text: team.teamLevel.name,
    },
  };
}