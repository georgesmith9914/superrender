# SuperRender
Dapp to render Blender files using IExec.

![image](https://user-images.githubusercontent.com/83978018/142742445-aca27e14-25f9-43b1-8e7e-eb2a68fdc183.png)  

![image](https://user-images.githubusercontent.com/83978018/142742463-8caa0189-ed1d-4601-b2d7-71c6b2502230.png)   

Steps to execute it on docker and deploy to IExec:  
1. Place a test blender file named blendfile.blend in /tmp/iexec_in in local VM  
2. chmod +x script.sh  
3. docker build . --tag blender-test-app  
4. docker run --rm     -v /tmp/iexec_in:/iexec_in     -v /tmp/iexec_out:/iexec_out     -e IEXEC_IN=/iexec_in     -e IEXEC_OUT=/iexec_out  -e IEXEC_INPUT_FILE_NAME_1=Blendfile7.blend -e IEXEC_INPUT_FILES_NUMBER=1 blender-test-app args1 arg2 arg3  
5. Check output in /tmp/iexec_out folder  
6. docker tag blender-test-app georgesmith9914/blender-render:1.0.9  
7. docker push georgesmith9914/blender-render:1.0.9  
8. Note down checksum value from: docker pull georgesmith9914/blender-render:1.0.9 | grep "Digest: sha256:" | sed 's/.*sha256:/0x/'  
"
9. nano iexec.json and change value of checksum from above and app multiaddr to "docker.io/georgesmith9914/blender-render:1.0.9"  
10. iexec app deploy --chain viviani  
11. iexec app publish --chain viviani  
12. Note down app 0x address  

Step to run Dapp:
1. npm install  
2. Update local scret.json  
3. npm run dev  
4. Open browser on port http://localhost:3000
5. Upload a blender file, enter frame number and start rendering
6. Check status of task by using URL https://v6.core.prod-main-pool.viviani.iex.ec/tasks/<task id>    
e.g.,  https://v6.core.prod-main-pool.viviani.iex.ec/tasks/0x71da3e95a2fe5a9c2ae8cb133b9cf658a68dced4b106f34523313ad46035c044   



