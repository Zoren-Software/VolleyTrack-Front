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
    teamCategory: team.teamCategory
      ? {
          value: Number(team.teamCategoryId),
          text: team.teamCategory.name,
        }
      : null,
    teamLevel: team.teamLevel
      ? {
          value: Number(team.teamLevelId),
          text: team.teamLevel.name,
        }
      : null,
  };
}