import {
    IExec,
    utils
} from "iexec";

var taskId;
var dealLocal;
var fileURL;
localStorage.setItem('fileName', ''); 
$("#myProgress").hide();
const resultsDownloadButton = document.getElementById("results-download-button");

$("#fileuploaderform").submit(function(e){
    event.preventDefault();
    console.log(this);
    var fileInput = document.getElementById('fileupload');   
    var filename = fileInput.files[0].name;
    if(! (fileInput.files[0].name.includes("blend"))){
        $.showNotification({
            body:"<h3>Please use a .blend file.</h3>"
      });
      return;
    }
    console.log(new FormData( this ));
    console.log("In fileupload handler")
    $.ajax( {
        url: '/fileupload',
        type: 'POST',
        data: new FormData( this ),
        processData: false,
        contentType: false,
        success: function(result){
            console.log(result);
            if(result.success == false){
                $.showNotification({
                    body:"<h3>Please select a file.</h3>"
              })

            }else {
                localStorage.setItem('fileName', result.file.filename); 
                //alert("File Uploaded successfully");    
                $.showNotification({
                      body:"<h3>File Uploaded successfully</h3>"
                })
                    
                $("#fileuploadbutton").prop("value", "Re-upload");
                fileURL = "https://gateway.pinata.cloud/ipfs/" + result.ipfsDetails.IpfsHash;
                console.log(fileURL);
            }
        }
      } );
      e.preventDefault();
})

const networkOutput = document.getElementById("network");
const addressOutput = document.getElementById("address");

const dropdownButton = document.getElementById("dropdownMenuButton2");

const docbody = document.body;

const refreshUser = (iexec) => async () => {
    const userAddress = await iexec.wallet.getAddress();
    const [wallet, account] = await Promise.all([
        iexec.wallet.checkBalances(userAddress),
        iexec.account.checkBalance(userAddress)
    ]);
    const nativeWalletText = `Native : ${utils.formatEth(wallet.wei).substring(0, 6)} RLC`;
    const rlcWalletText = `${utils.formatRLC(wallet.nRLC)} RLC`;
    addressOutput.innerText = userAddress;
};

function startProgressBar(){
    var i = 0;
        //function move() {
        if (i == 0) {
            i = 1;
            var elem = document.getElementById("myBar");
            var width = 1;
            var id = setInterval(frame, 2000);
            function frame() {
            if (width >= 100) {
                clearInterval(id);
                i = 0;
            } else {
                width++;
                elem.style.width = width + "%";
            }
            }
        }
}

function validateFields(){
    var validationStatus = true;
    var assetName = $("#assetName").val();
    if(localStorage.getItem('fileName') == ''){
        validationStatus = false;
        $.showNotification({
            body:"<h3>Please upload Blender file.</h3>"
      })
    }
    else if(assetName == ''){
        validationStatus = false;
        $.showNotification({
            body:"<h3>Please enter frame number.</h3>"
      })
    }
    return validationStatus;
}

const render = (iexec) => async () => {

    resultsDownloadButton.disabled = true;

    var validationStatus = validateFields();
    if(!validationStatus == true){
        return;
    }

    try {
        console.log(fileURL);
        console.log(await iexec.wallet.getAddress())
        docbody.classList.add("waiting");
        const appAddress = "0x42cF01a1BCe15A895714b6BF1C5567A92f008A9e";
        const category = "0";
        const params = {
            "iexec_input_files": [fileURL],
            "iexec_result_storage_provider": "ipfs"
          }
        const workerpool = "0xAd0b7eFEc0ABF34421B668ea7bCadaC12Dd97541";
        const trustLevel = "1";
        const {
            orders
        } = await iexec.orderbook.fetchAppOrderbook(appAddress);
        const appOrder = orders && orders[0] && orders[0].order;
        console.log(appOrder);
        if (!appOrder) throw Error(`no apporder found for app ${appAddress}`);

        const workerPoolRes = await iexec.orderbook.fetchWorkerpoolOrderbook(
            {workerpool: workerpool,
            category: category,
            minTrust : trustLevel}
        );
        console.log("workorderpool:" + workerPoolRes);
        const workerPoolOrders = workerPoolRes.orders;
        const workerpoolOrder =
        workerPoolOrders && workerPoolOrders[0] && workerPoolOrders[0].order;
        
        if (!workerpoolOrder)
            throw Error(`no workerpoolorder found for the selected options: category ${category}, trust level ${trustLevel}`);

        const userAddress = await iexec.wallet.getAddress();

        const requestOrderToSign = await iexec.order.createRequestorder({
            app: appAddress,
            appmaxprice: appOrder.appprice,
            workerpoolmaxprice: workerpoolOrder.workerpoolprice,
            requester: userAddress,
            workerpool: workerpool,
            volume: 1,
            params: params,
            trust: trustLevel,
            category: category
        });

        const requestOrder = await iexec.order.signRequestorder(requestOrderToSign);
        $("#myProgress").show();
        startProgressBar();
        const res = await iexec.order.matchOrders({
            apporder: appOrder,
            requestorder: requestOrder,
            workerpoolorder: workerpoolOrder
        });
        console.log(res.dealid);

        const deal = await iexec.deal.show(res.dealid);
        dealLocal = deal;
        console.log("task id " + deal.tasks["0"])
        taskId = deal.tasks["0"]
        $.showNotification({
            body:"<h3>Render job submitted with task id  " + taskId  + ".</h3>"
        })
        resultsDownloadButton.disabled = false;
        const localRes = await iexec.task.fetchResults(
            taskId
          );
        console.log("processed");
        
        refreshUser(iexec)();
    } catch (error) {
        docbody.classList.remove("waiting");
    } finally {
        docbody.classList.remove("waiting");
    }
};


const dowloadResults = (iexec) => async () => {
    try {
        docbody.classList.add("waiting");
        const taskid = taskId;
        console.log("download task id " + taskid);
          
        const res = await iexec.task.fetchResults(taskid, {
            ipfsGatewayURL: "https://ipfs.iex.ec"
        });
        console.log(res);
        console.log("result available");
        const file = await res.blob();
        const fileName = `${taskid}.zip`;
        if (window.navigator.msSaveOrOpenBlob)
            window.navigator.msSaveOrOpenBlob(file, fileName);
        else {
            const a = document.createElement("a");
            const url = URL.createObjectURL(file);
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    } catch (error) {
        console.log(error);
        $.showNotification({
            body:"<h3>File download is being prepared. Please try in some time.</h3>"
      })
        docbody.classList.remove("waiting");
    } finally {
        resultsDownloadButton.disabled = false;
        docbody.classList.remove("waiting");
    }
};

const init = async () => {
    console.log("came into init")
    try {
        docbody.classList.add("waiting");
        let ethProvider;

        ethereum.on('chainChanged', () => {
            document.location.reload()
          })


        if (window.ethereum) {
            console.log("using default provider");
            ethProvider = window.ethereum;
        }

        let networkmap = new Map([
            [133, "Viviani Sidechain"],
            [134, "Bellecour Sidechain"]
        ]);

        await ethProvider.enable();

        const {
            result
        } = await new Promise((resolve, reject) =>
            ethProvider.sendAsync({
                    jsonrpc: "2.0",
                    method: "net_version",
                    params: []
                },
                (err, res) => {
                    if (!err) resolve(res);
                    reject(Error(`Failed to get network version from provider: ${err}`));
                }
            )
        );
        const networkVersion = result;

        if (networkmap.get(parseInt(networkVersion)) == undefined) {
            console.log("check a.1");
            const error = `Unsupported network ${networkVersion}`;
            networkOutput.innerText = error;
            resultsDownloadButton.disabled = true;


            throw Error(error);
        }
        console.log("check 1");   
        networkOutput.innerText = networkmap.get(parseInt(networkVersion));
        resultsDownloadButton.disabled = true;
        const iexec = new IExec({
            ethProvider,
            chainId: networkVersion
        });

        await refreshUser(iexec)();
        //await checkStorage(iexec)();

        const buyBuyButton = document.getElementById("buy-buy-button");
        console.log("adding event handler now")
        buyBuyButton.addEventListener("click", render(iexec));

        resultsDownloadButton.addEventListener("click", dowloadResults(iexec));
        resultsDownloadButton.disabled = true;
    } catch (e) {
        console.error(e.message);
        docbody.classList.remove("waiting");
    }
};

init();
