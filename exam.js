


// A company is repainting its office and would like to choose colors that work well together. They are presented with several various-priced color options presented in a specific order so that each color complements the surrounding colors. The company has a limited budget and would like to select the greatest number of consecutive colors that fit within this budget. Given the prices of the colors and the company's budget, what is the maximum number of colors that can be purchased for this repainting project?

var price = [2, 3, 5, 1, 1, 2, 1];
var min = Math.min(price)
var money = 7; 


function getMaxColors(price, money) {

var curr, left, right, sol, stop

  if (min > money) {
      return 0
  }
  
  var sol = 0
  var [left, right] = [0, 0]
  var curr = price[0]
  
  while(true) {
      stop = true
      
      if (curr <= money ){
          sol = Math.max(sol, right - left + 1)
          right += 1
          
          if (right === price.length){
              break
          }
          
          curr += price[right]
          stop = false
      } else {
          if (curr > money){
              curr -= price[left]
              left += 1
              stop = false
          }

          console.log(curr)
          console.log(sol)
      }
      if (stop) {
          break
      }
  }
  return sol
}
console.log(getMaxColors(price, money))


    // it init --initial-branch=main