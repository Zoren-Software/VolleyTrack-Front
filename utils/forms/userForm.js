export function transformUserData(user) {
  return {
    ...user,
    positions: user.positions.map((position) => {
      return {
        id: Number(position.id),
        position: position.name,
      };
    }),
    teams: user.teams.map((team) => {
      return {
        id: Number(team.id),
        team: team.name,
      };
    }),
    roles: user.roles.map((role) => {
      return {
        id: Number(role.id),
        text: role.name,
      };
    }),
    phone: user?.information?.phone,
    cpf: user?.information?.cpf,
    rg: user?.information?.rg,
    password: "",
    confirmPassword: "",
  };
}