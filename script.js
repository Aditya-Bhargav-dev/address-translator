document.getElementById("virtualSpace").addEventListener("input", (e) => {
  
  document.getElementById("physicalSpace").value=e.target.value/2;
  document.getElementById("pageSize").hidden=false;


  });


document.getElementById("pageSize").addEventListener("input", (e) => {

  var virtualSpace = parseInt(document.getElementById("virtualSpace").value);
  var pageSize = parseInt(document.getElementById("pageSize").value);
  var numPages = Math.ceil(virtualSpace / pageSize);

  if(virtualSpace % pageSize  != 0)
  {
    document.getElementById("error").hidden=false;
    document.getElementById("pageTable").hidden=true;
    return
  }

  document.getElementById("error").hidden=true;
  document.getElementById("pageTable").hidden=false;

  var toBin = (numPages >>> 0).toString(2);

  let numBits = 0;
  
  for (let i = 0; i < toBin.length; i++) {
          if (toBin[i] === '0') {
              numBits++;
          }
      }

  localStorage.setItem("numBits",numBits);

  var pageTableBody = document.getElementById("pageTableBody");
  
  pageTableBody.innerHTML = "";
  for (var i = 0; i < numPages; i++) {
    var row = document.createElement("tr");

    var virtualIndex = document.createElement("td");
    var virtualIndexValue = (i >>> 0).toString(2).padStart(numBits, '0'); // Convert decimal to binary with 3 digits
   
    virtualIndex.id="vir"+i;
    virtualIndex.appendChild(document.createTextNode(virtualIndexValue));
    row.appendChild(virtualIndex);

    var physicalIndex = document.createElement("td");
    let physicalIndexInput = document.createElement("input");
    physicalIndexInput.type="number"
    physicalIndexInput.id = "phys"+i;
    physicalIndexInput.disabled = true;
    physicalIndex.appendChild(physicalIndexInput);
    row.appendChild(physicalIndex);


    var presentBit = document.createElement("td");
    presentBit.appendChild(document.createElement("input"));
    presentBit.id="pres"+i;
    presentBit.firstChild.type = "checkbox";
    row.appendChild(presentBit);
    
    pageTableBody.appendChild(row);

  }

  // Add event listener to present bit checkboxes
  for (let i = 0; i < numPages; i++) {
    const presentBitCheckbox = document.getElementById("pres" + i);
    presentBitCheckbox.addEventListener("change", (e) => {
      const isChecked = e.target.checked;
      document.getElementById("pres" + i).value = isChecked;
      const physicalIndexInput = document.getElementById("phys" + i);

      // Enable or disable the physical index input based on the present bit status
      physicalIndexInput.disabled = !isChecked;
      if(!isChecked)
      {
        physicalIndexInput.value="";
      }
    });
  }

});

function mappingData()
{
    var cols = [];
    var virIndex = [];
    var pageIndex = [];
    var presentbit = [];
    $('thead th').each(function(){
        cols.push($(this).text().toLowerCase());
    });
    
    for (let index = 0; index <  $('tbody tr').length; index++) {
        virIndex.push(document.getElementById("vir"+index).innerHTML);
        pageIndex.push(document.getElementById("phys"+index).value);
        presentbit.push(document.getElementById("pres"+index).value);        
    }

    return {virIndex,pageIndex,presentbit}
}



function converttoBinary(input) { 
let binaryResult = ''; 


for (const char of input) { 
  let codePoint = char.codePointAt(0); 
  if(codePoint>64)
  {
     codePoint = codePoint - 55;
  }
  else
  {
     codePoint = codePoint - 48;
  }
  const binaryValue =( codePoint >>> 0).toString(2);
  binaryResult += binaryValue.padStart(4, '0') + ' '; 
} 

 return binaryResult.trim(); 
} 

function converttoString(input)
{
  input=input.split(' ');
  result="";
  for (const char of input) { 
    let binval = parseInt(char, 2);
    if(binval>9)
    {
        binval+=55
    }
    else
    {
        binval+=48
    }
    result+=String.fromCharCode(binval);
    

  }
  return result;

}

function convertToPhysical()
{
    let input = document.getElementById("vir").value;
    input=input.toUpperCase();
    let binary = converttoBinary(input);
    document.getElementById("virtobin").innerHTML= "Binary Conversion-------> " + binary;
    

    ({virIndex,pageIndex,presentbit} = mappingData());

    let range = localStorage.getItem("numBits");

    let index = virIndex.indexOf(binary.slice(0,range));
    

    if(index==-1 || pageIndex[index]=="")
    {    
      
      document.getElementById("vrerror").hidden=false;
      document.getElementById("virtophy").innerHTML="";
      return;
    }
    document.getElementById("vrerror").hidden=true;
    let virtual = pageIndex[index]+binary.slice(range);
   

    let result = converttoString(virtual);

    document.getElementById("virtophy").innerHTML= "Physical Address-------> " + result ;

}

function convertToVirtual()
{
  let input = document.getElementById("phy").value;
  input=input.toUpperCase();
  let binary = converttoBinary(input);
  document.getElementById("phytobin").innerHTML= "Binary Conversion-------> " + binary ;
  

  let range = localStorage.getItem("numBits");
  ({virIndex,pageIndex,presentbit} = mappingData());

  let index = pageIndex.indexOf(binary.slice(1,range));

  if(index==-1)
  {    
    document.getElementById("pherror").hidden=false;
    document.getElementById("phytovir").innerHTML= "";
    return;
  }
  
  document.getElementById("pherror").hidden=true;
  

  let virtual = virIndex[index]+binary.slice(range);
  

  let result = converttoString(virtual);
  
  document.getElementById("phytovir").innerHTML= "Virtual Address-------> " + result;

}

function validateTable()
{
  ({virIndex,pageIndex,presentbit} = mappingData()); 
  
  var numOfTrue = presentbit.filter(x => x === true).length;
  const duplicates = pageIndex.filter((item, index) => pageIndex.indexOf(item) !== index && item!=""); 
  

  let pageIndexNumbers = []
  pageIndex.forEach(element => {
    pageIndexNumbers.push(converttoString(element))
  });
  
  if(numOfTrue ==0 || numOfTrue>pageIndex.length/2)
  {
      alert("No of Physical Index values should be: "+virIndex.length/2);
      document.getElementById("taberror").hidden=false;
      document.getElementById("binaryConversion").hidden=true;
  }
  else if(duplicates.length>0)
  {
    alert("Physical Index has duplicates, please correct");
    document.getElementById("taberror").hidden=false;
    document.getElementById("binaryConversion").hidden=true;
  }
  else if(pageIndexNumbers.some(el => el > virIndex.length/2 - 1))
  {
    alert("Physical Index should be from range 0 to "+virIndex.length/2);
    document.getElementById("taberror").hidden=false;
    document.getElementById("binaryConversion").hidden=true;

  }
  else
  {      
  document.getElementById("taberror").hidden=true;
  alert("Page Table Looks good go ahead with Conversion");
  document.getElementById("binaryConversion").hidden=false;
  }
 

}
