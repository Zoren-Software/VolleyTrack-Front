function convertDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const hour = date.getHours();
  const minute = date.getMinutes();
  return new Date(year, month, day, hour, minute);
}

export function transformTrainingData(training) {
  let teams = [];

  if (training.team) {
    teams = [
      {
        id: training.team.id,
        team: training.team.name,
      },
    ];
  }

  const fundamentals = training.fundamentals || [];
  const specificFundamentals = training.specificFundamentals || [];

  return {
    ...training,
    dateValue: convertDate(training.dateStart),
    timeStartValue: convertDate(training.dateStart),
    timeEndValue: convertDate(training.dateEnd),
    fundamentals: fundamentals.map((fundamental) => {
      return {
        id: Number(fundamental.id),
        fundamental: fundamental.name,
      };
    }),
    specificFundamentals: specificFundamentals.map((specificFundamental) => {
      return {
        id: Number(specificFundamental.id),
        specificFundamental: specificFundamental.name,
      };
    }),
    teams,
  };
}