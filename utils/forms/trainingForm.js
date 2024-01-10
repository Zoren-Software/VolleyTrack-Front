function convertDate(dateString) {
  //preciso que converta a data para este formato "Tue Jan 09 2024 21:00:45 GMT-0300 (Horário Padrão de Brasília)"
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const hour = date.getHours();
  const minute = date.getMinutes();
  return new Date(year, month, day, hour, minute);

}


export function transformTrainingData(training) {
  console.log(training)
  return {
    ...training,
    dateValue: convertDate(training.dateStart),
    timeStartValue: convertDate(training.dateStart),
    timeEndValue: convertDate(training.dateEnd),
    // TODO - Fazer aqui a transformação dos dados para o formato que o form espera
    // Aqui falta fazer da segunda parte do form em diante "Fundamentos Treinados"
  };
}