export function getStreak(days){
  const keyFor = (date) => {
    const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,'0'),d=String(date.getDate()).padStart(2,'0');
    return y+'-'+m+'-'+d;
  };
  let streak=0;
  const cursor=new Date();
  cursor.setHours(0,0,0,0);
  for(;;){
    const item=days[keyFor(cursor)];
    if(!item || (!(item.pages||[]).length && !Object.values(item.habits||{}).some(Boolean))) break;
    streak++;
    cursor.setDate(cursor.getDate()-1);
  }
  return streak;
}
