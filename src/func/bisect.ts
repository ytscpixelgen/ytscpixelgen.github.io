const bisect = function (sortedList: number[], el: number){
  if(!sortedList.length) return 0;

  if(sortedList.length === 1) {
    return el > sortedList[0] ? 1 : 0;
  }

  let lbound = 0;
  let rbound = sortedList.length - 1;
  return bisect(lbound, rbound);

// note that this function depends on closure over lbound and rbound
// to work correctly
  function bisect (lb: number, rb: number): number{
    if(rb - lb === 1){
      if(sortedList[lb] < el && sortedList[rb] >= el){
        return lb + 1;
      }

      if(sortedList[lb] === el){
        return lb;
      }
    }

    if(sortedList[lb] > el){
      return 0;
    }

    if(sortedList[rb] < el){
      return sortedList.length
    }

    let midPoint = lb + (Math.floor((rb - lb) / 2));
    let midValue = sortedList[midPoint];

    if(el <= midValue){
      rbound = midPoint
    }

    else if(el > midValue){
      lbound = midPoint
    }

    return bisect(lbound, rbound);
  }
};
export {bisect };