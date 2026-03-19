export const generateChannelId = (id1: string, id2: string) => {
  const sortedIds = [id1, id2].sort().join("");
  
  let hash = 0;
  for (let i = 0; i < sortedIds.length; i++) {
    const char = sortedIds.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; 
  }
  return `c_${Math.abs(hash)}`; 
};