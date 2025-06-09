// function getFactorials(arr, ans) {

// }

// let ans = [];

// function getNumber() {
//   let userInput;
//   let numberInput;

//   while (true) {
//     userInput = prompt("Enter a number:");
//     numberInput = parseInt(userInput);

//     if (!isNaN(numberInput)) {
//       break; // Exit the loop if input is a valid number
//     } else {
//       alert("Invalid input. Please enter a number.");
//     }
//   }
//   return numberInput;
// }

// function numberToVector(num) {
//   const arr = [];
//   console.log(num);

//     while(num>0){
//         arr.push(num%10);
//         num /= 10;
//     }

//     console.log(arr);

//   return arr;
// }

// let num = getNumber();

// let arr = numberToVector(num);

// getFactorials(arr, ans);

let num = 0;

document
  .getElementById("submit_button")
  .addEventListener("click", function (event) {
    event.preventDefault();
    getNumber();
  });
function getNumber() {
  num = document.getElementById("number").value;
  calculateFactorial(num);
}

function calculateFactorial(num) {
  let ans = [1];
  for (var i = 1; i <= num; i++) {
    ans = do_math(ans, i);
  }
  ans = ans.map((a)=>(a.toString().padStart(10,'0')));
  let finalAns = ans.join('');   
  document.getElementById("answer").innerHTML = finalAns;
  document.getElementById("ansLength").innerHTML = finalAns.length;
}

function do_math(ans, num) {
  var ind = ans.length - 1;
  var carry = 0;
  while (ind >= 0) {
    var x = (ans[ind] * num) + carry;
    ans[ind] = x % 10000000000;
    carry = Math.floor(x / 10000000000);
    ind--;    
  }
  while(carry > 0){
    var z = carry % 10000000000;
    carry = Math.floor(carry / 10000000000); 
    ans.unshift(z);
  }
  return ans;
}

// console.log(num);
