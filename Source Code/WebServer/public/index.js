const fs = require('fs');
const customer = {
    name: "Qodos Co.",
    order_count: 0,
    address: "Po Box City",
}

// const data = JSON.stringify(index.html);

const jsonString = JSON.stringify(customer);
function sendData()
{
fs.writeFile('test.json', jsonString, err => {
   if (err) {
       console.log('Error writing file', err)
       //document.querySelector("#demoP").innerText = "Successfully wrote file";
   } else {
       console.log('Successfully wrote file')
     //  document.querySelector("#demoP").innerText = "Successfully wrote file";
   }
})

}

function getData()
{
fetch("test.json")
    .then(response => response.json())
    .then(data => {
     document.querySelector("#demoP").innerText = data.name
    })
}





