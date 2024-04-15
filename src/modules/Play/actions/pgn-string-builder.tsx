export const pgnStringBuilder = (pgnArr: string[], reviewLength: number) => {
  let index = 1;
  const arr = [...pgnArr];
  arr.length = reviewLength + 1;
  const newArr = [];
  for (let i = 0; i <= arr.length; i = i + 2) {
    if (arr[i] !== undefined) {
      newArr.push(`${index}. ${arr[i]} ${arr[i + 1] || ""}`);
    }
    index++;
  }
  // console.log(newArr)
  return newArr.join(" ");
}