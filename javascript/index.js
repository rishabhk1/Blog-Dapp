var blog;
var userAccount;
var accounts;
//var Web3= require('web3');
var Web3;
var blogSize;
var tiparray=[];

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

function postBlog(){   
    
    let tex=document.getElementById("content");
    let ans=tex.value;
    document.getElementById("content").value="";
    
    blog.methods.createBlog(ans).send({from:userAccount})
    .on("receipt",function(receipt){
        $("#status").text("Blog successfully posted");

    })
    .on("error",function(error){
        console.log(ans);
        $("#status").text(error);
    });

}


/*function displayBlogs(ids){
    $("#blog").empty();
    for(id of ids){
        console.log(id);
        getBlogDetails(id)
        .then(function(b){
            console.log(b);
            let s="<div class=\"card\">"+b.content+Date(b.time).substring(4,21)+"</div>";
            $("#blog").append(
                s
            );
        });
    }
}*/

async function displayBlogs(){
    let id= await getBlogSize();

    $("#feed").empty();
    
    for(let i=id-1;i>=0;i--){
        
        getBlogDetails(i)
        .then(function(b){
            
            let s=`<div class="blogcard" >
            <img src="./images/costume.png" class="profile"></svg>
            <div class="blogcardaddress"><a href="./${b.owner_address}">${b.owner_address}</a></div>
            <div class="blogcardcontent">${b.content}</div>
            <input type="text" id="tipamount${i.toString()}" class="tipamount" placeholder="ether">
            <button float="left" onclick="payTipToOwner(${i})" class="tipbutton">tip</button>
            <div class="currenttip">received ${Web3.utils.fromWei((b.tip).toString(), 'ether')}</div></div>`;
            
            $("#feed").append(

                s
            );
        });
    }
}

/*async function getBlog(){
 console.log(await blog.methods.displayMyBlogs().call());
    return await blog.methods.displayMyBlogs().call({from:userAccount});
}*/

/*function display(){
    getBlog().then(displayBlogs);
}*/

var intervalId = window.setInterval(async function(){
    
    let id= await getBlogSize();
    
    if(typeof blogSize =='undefined'){
        blogSize=await getBlogSize();
        
        displayBlogs();
        filltiparray();
    }
    else if(blogSize !== id ){
        blogSize= await getBlogSize();
        
        displayBlogs();
        filltiparray();
    }
    else{
        let flag=false;
        for(let i=blogSize-1;i>=0;i--){
            let x = await getBlogDetails(i);
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
    }
  }, 2000);

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
        $("#status").text("Blog successfully posted");
        getBlog().then(displayBlogs);
        filltiparray();
    })
    .on("error",function(error){
        console.log(ans);
        $("#status").text(error);
    });
}

async function filltiparray(){
    tiparray=[];
    
    for(let i=blogSize-1;i>=0;i--){
            let x= await getBlogDetails(i);
            
            
            tiparray.push(x.tip);
    }
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

focusMethod = function getFocus() {
    document.getElementById("content").focus();
}




window.addEventListener('load', function(){
    loadWeb3();
    console.log("load web3 worked");
    startApp();
})