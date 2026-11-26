export function getStreak(days){
  let streak=0;
  const cursor=new Date();
  for(;;){
    const key=cursor.toISOString().slice(0,10);
    const item=days[key];
    if(!item || (!(item.pages||[]).length && !Object.values(item.habits||{}).some(Boolean))) break;
    streak++;
    cursor.setUTCDate(cursor.getUTCDate()-1);
  }
  return streak;
}
