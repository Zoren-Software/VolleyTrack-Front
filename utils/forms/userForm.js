export function transformUserData(user) {
  return {
    ...user,
    positions: user.positions.map((position) => {
      return {
        id: Number(position.id),
        name: position.name,
      };
    }),
    teams: user.teams.map((team) => {
      return {
        id: Number(team.id),
        team: team.name,
      };
    }),
    roles: user.roles && Array.isArray(user.roles) 
      ? user.roles.map((role) => Number(role.id))
      : [],
    phone: user?.information?.phone,
    cpf: user?.information?.cpf,
    rg: user?.information?.rg,
    password: "",
    confirmPassword: "",
  };
}