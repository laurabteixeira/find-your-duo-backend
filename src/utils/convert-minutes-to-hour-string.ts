export function convertMinutesToHourString(minutesAmount: number) {
  const hours = Math.floor(minutesAmount / 60);

  const minutes = minutesAmount % 60;

  // 'padStart' vai adicionar um '0' na frente do número caso ele tenha apenas 1 caractere. (Só funciona para strings).
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}