var NumPeople;
var people = [];
var amountEach;

window.onload = function() {

    document.getElementById("NumberOfPeople").focus();

    document.getElementById("BtnPeopleGenerator").addEventListener('click', function(){
        GeneratePeopleInputs();
    });

    document.getElementById("BtnCalculate").addEventListener('click', function(){
        if (!validarCampos()) {
            return;
        }
        CalculaTotal();
        CalculaQuienPagaAQuien();
        MuestraQuienPagaAQuien();
    });

    document.getElementById("BtnReset").addEventListener('click', function(){
        reset();
        resetPeople();
    });
};

//Generate People Name and Amount payed inputs on PeopleInputs div
function GeneratePeopleInputs(){
    reset();

    NumPeople = document.getElementById("NumberOfPeople").value -1;
    let people = document.getElementById("PeopleInputs");

    for(i = 0; i <= NumPeople; i++) {
        //create input to enter person name
        person = document.createElement('input');
        person.setAttribute("id", "person"+i);
        person.setAttribute("placeholder", "Person "+(i+1));
        person.setAttribute("class", "personinput person");

        //create input to enter amount payed by the person
        valueInput = document.createElement('input');
        valueInput.setAttribute("id", "amount"+i);
        valueInput.setAttribute("placeholder", "$0.00");
        valueInput.setAttribute("onkeypress", "return isNumberKey(event)");
        valueInput.setAttribute("class", "personinput amount");

        people.appendChild(person);
        people.appendChild(valueInput);
        people.appendChild(document.createElement('br'));
    }
}

function deleteChild(Node) { 
    while (Node.firstChild) {
        Node.removeChild(Node.firstChild);
    }
}

function reset () {
    document.getElementById("pTotal").innerHTML = "Total: ";
    document.getElementById("pEach").innerHTML = "Each: ";

    let PeopleInputsNode = document.getElementById('PeopleInputs');
    deleteChild(PeopleInputsNode);
    
    let toFrom = document.getElementById('listTransaction');
    deleteChild(toFrom);

    document.getElementById('inputsError').setAttribute('class', 'hidden');
}

function resetPeople() {
    document.getElementById("NumberOfPeople").value = '';
}

function validarCampos() {
    let inputs = Array.from(document.getElementsByClassName('personinput'));
    if (inputs.length === 0) {
        return;
    }
    let inputsFilled = inputs.every( e => {
        return e.value.length > 0;
    });
    if (!inputsFilled) {
        document.getElementById('inputsError').removeAttribute('class', 'hidden');
        return false;
    } else {
        document.getElementById('inputsError').setAttribute('class', 'hidden');
        return true;
    }
}

//calcula el total de los costos de cada persona sumados
function CalculaTotal(){
    let total = 0;
    GeneratePeopleArray();
    people.forEach(function (element) { //Podria hacerse con un reduce? como?
        total += element.amount;
    });

    //cuando debe pagar cada uno redondeado hacia abajo.
    amountEach = Math.floor((total/people.length)*100)/100;

    document.getElementById("pTotal").innerHTML = "Total: " + total;
    document.getElementById("pEach").innerHTML = "Each: " + amountEach;
}

//calcula quien debe pagar o debe cobrar, cuanto y a quien o de quien. Para cada elemento
//del arreglo personas, establece a quien le deebe pagar y cuanto y
//de quien debe cobrar y cuanto.
function CalculaQuienPagaAQuien(){
    
    let min = getPeopleMin(people);
    while(min.amount != amountEach && min.amount < amountEach){
        let max = getPeopleMax(people);
        let amountToPay = (amountEach - min.amount).toFixed(2);
        
            people[min.indicePeople].payTo.push({
                                                index: max.indicePeople,
                                                name: people[max.indicePeople].name, 
                                                amount: amountToPay
                                                });
            people[max.indicePeople].receiveFrom.push({
                                                index: min.indicePeople,
                                                name: people[min.indicePeople].name,
                                                amount: amountToPay
                                                });
            
            people[min.indicePeople].actAmount = amountEach;
            people[max.indicePeople].actAmount -= amountToPay;

        min = getPeopleMin(people);         
    }
};

//returns an object with the index of the person whose amount is the lowest, and 
//the amount value
function getPeopleMin(currPeople){
    //return currPeople.reduce((min, p) => p.actAmount < min ? p.actAmount: min, currPeople[0].actAmount);}
    //Como hacerlo de este modo?
    let amount = currPeople[0].actAmount;
    let indicePeople = 0;
    for(i = 0; i < currPeople.length; i++){
        if(currPeople[i].actAmount < amount){
            amount = currPeople[i].actAmount;
            indicePeople = i;
        }
    }
    return {indicePeople, amount}
}

//returns an object with the index of the person whose amount is the highest, and 
//the amount value
function getPeopleMax(currPeople){
    //return currPeople.reduce((max, p) => p.actAmount > max ? p.actAmount: max, currPeople[0].actAmount);
    //Como hacerlo de este modo?
    let amount = currPeople[0].actAmount;
    let indicePeople = 0;
    for(i = 0; i < currPeople.length; i++){
        if(currPeople[i].actAmount > amount){
            amount = currPeople[i].actAmount;
            indicePeople = i;
        }
    }
    return {indicePeople, amount}
}

//Generate array of people objects with its corresponding attributes.
function GeneratePeopleArray(){
    people = [];
    for(i = 0; i <= NumPeople; i++){
        let elem = {  name: document.getElementById("person"+i).value, 
                      amount: parseFloat(document.getElementById("amount"+i).value),
                      actAmount: parseFloat(document.getElementById("amount"+i).value),
                      payTo: [], 
                      receiveFrom: []
                    };
        people.push(elem);
    }
}

function MuestraQuienPagaAQuien(){
    let transaction = document.querySelector( "#toFrom ul" );
    transaction.text = '';
    people.forEach( element => {
        //create paragraph for each person name
        let paraName = document.createElement('li');
        let header = document.createElement('h3');
        let text = document.createTextNode(element.name);
        header.appendChild(text);
        paraName.appendChild(header);
        transaction.appendChild(paraName);
        paraName.setAttribute('class', 'toFrom');

        //append to each person name, who to pay and who to receive from
        let paraPayTo = document.createElement('p');
        text = document.createTextNode('To');
        paraPayTo.appendChild(text);
        paraName.appendChild(paraPayTo);

        let list = document.createElement('ul');
        paraName.appendChild(list);
        element.payTo.forEach( element => {
            let li = document.createElement('li');
            li.textContent = element.name + ': ' + element.amount;
            list.appendChild(li);
        });

        let paraReceiveFrom = document.createElement('p');
        text = document.createTextNode('From');
        paraReceiveFrom.appendChild(text);
        paraName.appendChild(paraReceiveFrom);

        list = document.createElement('ul');
        paraName.appendChild(list);
        element.receiveFrom.forEach( element => {
            let li = document.createElement('li');
            li.textContent = element.name + ': ' + element.amount;
            list.appendChild(li);
        });
    });
}

function isNumberKey(evt)
{
   let charCode = (evt.which) ? evt.which : event.keyCode
   if (charCode > 31 && (charCode < 48 || charCode > 57))
      return false;

   return true;
}