var NumPeople;
var people = [];
var amountEach;

window.onload = function() {

    document.getElementById("NumberOfPeople").focus();

    document.getElementById("BtnPeopleGenerator").addEventListener('click', function(){
        GeneratePeopleInputs();
    });

    document.getElementById("BtnCalculate").addEventListener('click', function(){
        console.log(validateInputs());
        if (!validateInputs()) {
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
    people = document.getElementById("peopleInputsContainer");
    if (NumPeople >= 0) {
        document.getElementById("peopleInputsContainer").removeAttribute('class', 'hidden');
        document.getElementById("calculateContainer").removeAttribute('class', 'hidden');
    }

    for(i = 0; i <= NumPeople; i++) {
        //create input to enter person name
        let person = document.createElement('input');
        person.setAttribute("id", "person"+i);
        person.setAttribute("placeholder", "Person "+(i+1));
        person.setAttribute("class", "personInput person");
        person.addEventListener("keyup", validateInput);
        
        //create input to enter amount payed by the person
        valueInput = document.createElement('input');
        valueInput.setAttribute("id", "amount"+i);
        valueInput.setAttribute("placeholder", "$");
        valueInput.setAttribute("onkeypress", "return isNumberKey(event)");
        valueInput.setAttribute("class", "personInput amount");
        valueInput.addEventListener("keyup", validateInput);

        valueInput.setAttribute("value", i);
        person.setAttribute("value", 'Person' + i);

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

    let PeopleInputsNode = document.getElementById('peopleInputsContainer');
    deleteChild(PeopleInputsNode);
    
    let toFrom = document.getElementById('listTransaction');
    deleteChild(toFrom);

    document.getElementById('inputsError').setAttribute('class', 'hidden');
    document.getElementById("peopleInputsContainer").setAttribute('class', 'hidden');
    document.getElementById("calculateContainer").setAttribute('class', 'hidden');

    document.getElementById('BtnCalculate').disabled = false;
}

function resetPeople() {
    document.getElementById("NumberOfPeople").value = '';
}

function validateInputs() {
    let inputs = Array.from(document.getElementsByClassName('personInput'));
    if (inputs.length === 0) {
        return;
    }
    let inputsFilled = inputs.every( e => {
        return e.value.length > 0;
    });
    if (!inputsFilled) {
        document.getElementById('inputsError').classList.remove('hidden');
        inputs.forEach( e => {
             if (e.value.length <= 0) {
                 document.getElementById(e.id).classList.add('error');
             }
        })
        return false;
    } else {
        document.getElementById('inputsError').setAttribute('class', 'hidden');
        return true;
    }
}

function validateInput() {
    if (this.value === '') {
        this.classList.add('error');
    } else {
        this.classList.remove('error');
    }
}

//calcula el total de los costos de cada persona sumados
function CalculaTotal(){
    let total = 0;
    people = GeneratePeopleArray();
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
    let people = [];
    for(i = 0; i <= NumPeople; i++){
        let elem = {
            name: document.getElementById("person"+i).value, 
            amount: parseFloat(document.getElementById("amount"+i).value),
            actAmount: parseFloat(document.getElementById("amount"+i).value),
            payTo: [], 
            receiveFrom: []
        };
    people.push(elem);
    }
    return people
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
        paraName.setAttribute('class', 'transaction');

        //append to each person name, who to pay and who to receive from
        
        let toFromDiv = document.createElement('div');
        toFromDiv.setAttribute('class', 'toFrom');
        paraName.appendChild(toFromDiv);
        
        let paraPayTo = document.createElement('p');
        paraPayTo.setAttribute('class', 'to');

        text = document.createTextNode('To');
        paraPayTo.appendChild(text);
        toFromDiv.appendChild(paraPayTo);

        let list = document.createElement('ul');
        toFromDiv.appendChild(list);

        element.payTo.forEach( element => {
            let li = document.createElement('li');
            let span = document.createElement('span');
            span.textContent = element.name;
            li.appendChild(span);

            span = document.createElement('span');
            span.textContent = element.amount;
            li.appendChild(span);

            li.setAttribute('class', 'space-around');
            list.appendChild(li);
        });

        toFromDiv = document.createElement('div');
        toFromDiv.setAttribute('class', 'toFrom');
        paraName.appendChild(toFromDiv);

        let paraReceiveFrom = document.createElement('p');
        paraReceiveFrom.setAttribute('class', 'from');

        text = document.createTextNode('From');
        paraReceiveFrom.appendChild(text);
        toFromDiv.appendChild(paraReceiveFrom);

        list = document.createElement('ul');
        toFromDiv.appendChild(list);

        element.receiveFrom.forEach( element => {
            let li = document.createElement('li');

            let span = document.createElement('span');
            span.textContent = element.name;
            li.appendChild(span);

            span = document.createElement('span');
            span.textContent = element.amount;
            li.appendChild(span);

            li.setAttribute('class', 'space-around');
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