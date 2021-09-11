var url = window.location.href
//const params = Object.fromEntries(urlSearchParams.entries());
var address=url.substring(url.length-42,url.length);
console.log(address);
var blogSize;
var tiparray=[];
var totaltip=0;

async function startApp(){
    var blogAddress='0x22DE3C772cc9250C283271C35A450cb5374448B3';
    var blogABI=JSON.parse(JSON.stringify([
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "content",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "time",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "tip",
                    "type": "uint256"
                }
            ],
            "name": "NewBlog",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "blog",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "owner_address",
                    "type": "address"
                },
                {
                    "internalType": "string",
                    "name": "content",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "time",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "tip",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_content",
                    "type": "string"
                }
            ],
            "name": "createBlog",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "displayMyBlogs",
            "outputs": [
                {
                    "internalType": "uint256[]",
                    "name": "",
                    "type": "uint256[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getBlogSize",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_id",
                    "type": "uint256"
                }
            ],
            "name": "payTipToOwner",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "users",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ]));
    blog=new web3.eth.Contract(blogABI,blogAddress);
    
    accounts=await web3.eth.getAccounts();
    userAccount=accounts[0];
    $(".account").text(userAccount);
    
    //$(".mylogo").prop(data-jdenticon-value,userAccount.substring(0,21));
    blogSize=await getBlogSize();
    displayBlogs();
    filltiparray();


}

async function displayBlogs(){
    let id= await getBlogSize();

    $("#feed").empty();
    
    for(let i=id-1;i>=0;i--){
        
        getBlogDetails(i)
        .then(function(b){

            if(b.owner_address!=address) return;
            
            let s=`<div class="blogcard" >
            <img src="./images/costume.png" class="profile"></svg>
            <div class="blogcardaddress">${b.owner_address}</div>
            <div class="blogcardcontent">${b.content}</div>
            <input type="text" id="tipamount${i.toString()}" class="tipamount" placeholder="ether">
            <button float="left" onclick="payTipToOwner(${i})" class="tipbutton">tip</button>
            <div class="currenttip">received ${Web3.utils.fromWei((b.tip).toString(), 'ether')}</div></div>`;
            
            $("#feed").append(s);
        });
    }
}




var intervalId = window.setInterval(async function(){
        let flag=false;
        for(let i=blogSize-1;i>=0;i--){
            let x = await getBlogDetails(i);
            if(x.owner_address!=address) continue;  
            if(x.tip != tiparray[blogSize-i-1]){
                flag=true;
                let y=await getBlogDetails(i)
                tiparray[i]=y.tip;
            }
        }
        if(flag){
            console.log('ddd',id);
            filltiparray();
            displayBlogs();
            
        }
    
  }, 2000);


async function filltiparray(){
    tiparray=[];
    totaltip=0;
    
    for(let i=blogSize-1;i>=0;i--){
            let x= await getBlogDetails(i);     
            tiparray.push(x.tip);
            if(x.owner_address==address){
                totaltip+=parseFloat(Web3.utils.fromWei((x.tip).toString(), 'ether'));
            }
    }

    document.getElementById("totaltip").textContent=totaltip;
}



async function getBlogDetails(id){
    return await blog.methods.blog(id).call();
}
async function getBlogSize(){
    return await blog.methods.getBlogSize().call();
}

function payTipToOwner(no){
    console.log('payto owner',no.toString());
    var x=document.getElementById("tipamount"+no.toString());
    var r=x.value;
    document.getElementById("tipamount"+no.toString()).value="";
    blog.methods.payTipToOwner(no).send({
        from:userAccount,
        value:Web3.utils.toWei((r).toString(), 'ether')
    })
    .on("receipt",function(receipt){
        //$("#status").text("Blog successfully posted");
        getBlog().then(displayBlogs);
        filltiparray();
    })
    .on("error",function(error){
        console.log(ans);
        //$("#status").text(error);
    });
}

async function loadWeb3(){
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
}




window.addEventListener('load', function(){
    loadWeb3();
    console.log("load web3 worked");
    startApp();
})



/*export function f1() {...}
And then in file 2;

import { f1 } from "./file1.js";
f1();
You can export the variable from first file using export.

//first.js
const colorCode = {
    black: "#000",
    white: "#fff"
};
export { colorCode };
Then, import the variable in second file using import.

//second.js
import { colorCode } from './first.js'



*/