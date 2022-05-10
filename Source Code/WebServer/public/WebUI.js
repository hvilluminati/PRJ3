
function addToOrder()
{
    //bare for test i json file
fetch("test.json")
    .then(response => response.json())
    .then(data => {
     document.querySelector("#orderCount").innerText = data.order_count,
     document.querySelector("#orderSize").innerText = data.order_size,
     document.getElementById('showPaymentMethodBtn').style.visibility = "visible",
     document.getElementById('edit').style.visibility = "visible",
     document.getElementById('ADD').style.visibility = "hidden",
     document.getElementById('beerNum').style.visibility = "hidden",
     document.getElementById('selectBeer').style.visibility = "hidden",
     document.getElementById('cancel').style.visibility = "visible"
    })


function cancelOrder()
{
        document.querySelector("#orderCount").innerText = 0,
        document.querySelector("#orderSize").innerText = "SMALL",
        document.getElementById('buy').style.visibility = "hidden",
        document.getElementById('edit').style.visibility = "hidden",
        document.getElementById('ADD').style.visibility = "visible",
        document.getElementById('beerNum').style.visibility = "visible",
        document.getElementById('selectBeer').style.visibility = "visible",
        document.getElementById('cancel').style.visibility = "hidden"
}


}

function editData()
{
     document.getElementById('showPaymentMethodBtn').style.visibility = "hidden",
     document.getElementById('edit').style.visibility = "hidden",
     document.getElementById('ADD').style.visibility = "visible",
     document.getElementById('beerNum').style.visibility = "visible",
     document.getElementById('selectBeer').style.visibility = "visible"
}


function showPaymentMethod()
{
     document.getElementById('payment').style.visibility = "visible"
}




function showQRCode()
{
        document.getElementById('QR-kode').style.visibility = "visible"
    
}

function selectPaymentMethod(betalingMethod ) {
    
}
function addDrinkandSize(drink,size) {
    
}
function giveC_QR() {}

function paymentAcknowledged (){}
function goToBasket() {}

function SelectReturn() {}

function showOrder(){}

function goToPayment(){}

