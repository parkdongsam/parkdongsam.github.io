## LAB
- OS : RHEL 7.8 (Minimal Install)  
- Network : NAT/Public (100.100.100.0/24)    
<br>

---
## Create Repository
- ISO 혹은 CD를 마운트 합니다.

```TEXT
# mount /dev/sr0 /mnt
mount: /mnt: WARNING: device write-protected, mounted read-only
```

- repo 파일을 생성합니다.

```TEXT
#vi /etc/yum.repos.d/local.repo
```
```bash
[Local]
name=Local
baseurl=file:///mnt/
gpgcheck=0
```
<br>

---
## Install
- Docker CE Repository를 추가합니다.

```TEXT
#yum -y install yum-utils
```
```bash
Loaded plugins: product-id, search-disabled-repos, subscription-manager

This system is not registered with an entitlement server. You can use subscription-manager to register.

Resolving Dependencies
--> Running transaction check
---> Package yum-utils.noarch 0:1.1.31-53.el7 will be installed
--> Processing Dependency: python-kitchen for package: yum-utils-1.1.31-53.el7.noarch
--> Running transaction check
---> Package python-kitchen.noarch 0:1.1.1-5.el7 will be installed
--> Processing Dependency: python-chardet for package: python-kitchen-1.1.1-5.el7.noarch
--> Running transaction check
---> Package python-chardet.noarch 0:2.2.1-3.el7 will be installed
--> Finished Dependency Resolution

Dependencies Resolved

====================================================================================
 Package                Arch           Version                  Repository     Size
====================================================================================
Installing:
 yum-utils              noarch         1.1.31-53.el7            Local         122 k
Installing for dependencies:
 python-chardet         noarch         2.2.1-3.el7              Local         227 k
 python-kitchen         noarch         1.1.1-5.el7              Local         266 k

Transaction Summary
====================================================================================
Install  1 Package (+2 Dependent packages)

Total download size: 615 k
Installed size: 2.8 M
Downloading packages:
------------------------------------------------------------------------------------
Total                                                   59 MB/s | 615 kB  00:00     
Running transaction check
Running transaction test
Transaction test succeeded
Running transaction
  Installing : python-chardet-2.2.1-3.el7.noarch                                1/3
  Installing : python-kitchen-1.1.1-5.el7.noarch                                2/3
  Installing : yum-utils-1.1.31-53.el7.noarch                                   3/3
  Verifying  : yum-utils-1.1.31-53.el7.noarch                                   1/3
  Verifying  : python-kitchen-1.1.1-5.el7.noarch                                2/3
  Verifying  : python-chardet-2.2.1-3.el7.noarch                                3/3

Installed:
  yum-utils.noarch 0:1.1.31-53.el7                                                  

Dependency Installed:
  python-chardet.noarch 0:2.2.1-3.el7      python-kitchen.noarch 0:1.1.1-5.el7     

Complete!
```
```TEXT
#yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```
- CentOS용 Repository를 정상적으로 추가하여도 설치 시 에러가 발생합니다.

```TEXT
#yum install docker-ce
```

```bash
Loaded plugins: product-id, search-disabled-repos, subscription-manager

This system is not registered with an entitlement server. You can use subscription-manager to register.

Resolving Dependencies
--> Running transaction check
---> Package docker-ce.x86_64 3:19.03.9-3.el7 will be installed
--> Processing Dependency: container-selinux >= 2:2.74 for package: 3:docker-ce-19.03.9-3.el7.x86_64
--> Processing Dependency: containerd.io >= 1.2.2-3 for package: 3:docker-ce-19.03.9-3.el7.x86_64
--> Processing Dependency: libseccomp >= 2.3 for package: 3:docker-ce-19.03.9-3.el7.x86_64
--> Processing Dependency: docker-ce-cli for package: 3:docker-ce-19.03.9-3.el7.x86_64
--> Processing Dependency: libcgroup for package: 3:docker-ce-19.03.9-3.el7.x86_64
--> Processing Dependency: libseccomp.so.2()(64bit) for package: 3:docker-ce-19.03.9-3.el7.x86_64
--> Running transaction check
---> Package containerd.io.x86_64 0:1.2.13-3.2.el7 will be installed
--> Processing Dependency: container-selinux >= 2:2.74 for package: containerd.io-1.2.13-3.2.el7.x86_64
---> Package docker-ce.x86_64 3:19.03.9-3.el7 will be installed
--> Processing Dependency: container-selinux >= 2:2.74 for package: 3:docker-ce-19.03.9-3.el7.x86_64
---> Package docker-ce-cli.x86_64 1:19.03.9-3.el7 will be installed
---> Package libcgroup.x86_64 0:0.41-21.el7 will be installed
---> Package libseccomp.x86_64 0:2.3.1-4.el7 will be installed
--> Finished Dependency Resolution
Error: Package: containerd.io-1.2.13-3.2.el7.x86_64 (docker-ce-stable)
           Requires: container-selinux >= 2:2.74
Error: Package: 3:docker-ce-19.03.9-3.el7.x86_64 (docker-ce-stable)
           Requires: container-selinux >= 2:2.74
 You could try using --skip-broken to work around the problem
 You could try running: rpm -Va --nofiles --nodigest
```
- `container-selinux` 패키지는 Local Repository(ISO)에 없기 때문에 다운로드가 필요합니다.

```TEXT
#wget http://mirror.centos.org/centos/7/extras/x86_64/Packages/container-selinux-2.107-3.el7.noarch.rpm
```
!!! Tip
    `wget` 명령어는 wget 패키지 설치가 필요합니다.  (#yum -y install wget)

```TEXT
#yum localinstall container-selinux-2.107-3.el7.noarch.rpm
```
```bash
Loaded plugins: product-id, search-disabled-repos, subscription-manager

This system is not registered with an entitlement server. You can use subscription-manager to register.

Examining container-selinux-2.107-3.el7.noarch.rpm: 2:container-selinux-2.107-3.el7.noarch
Marking container-selinux-2.107-3.el7.noarch.rpm to be installed
Resolving Dependencies
--> Running transaction check
---> Package container-selinux.noarch 2:2.107-3.el7 will be installed
--> Processing Dependency: policycoreutils-python for package: 2:container-selinux-2.107-3.el7.noarch
--> Running transaction check
---> Package policycoreutils-python.x86_64 0:2.5-34.el7 will be installed
--> Processing Dependency: setools-libs >= 3.3.8-4 for package: policycoreutils-python-2.5-34.el7.x86_64
--> Processing Dependency: libsemanage-python >= 2.5-14 for package: policycoreutils-python-2.5-34.el7.x86_64
--> Processing Dependency: audit-libs-python >= 2.1.3-4 for package: policycoreutils-python-2.5-34.el7.x86_64
--> Processing Dependency: python-IPy for package: policycoreutils-python-2.5-34.el7.x86_64
--> Processing Dependency: libqpol.so.1(VERS_1.4)(64bit) for package: policycoreutils-python-2.5-34.el7.x86_64
--> Processing Dependency: libqpol.so.1(VERS_1.2)(64bit) for package: policycoreutils-python-2.5-34.el7.x86_64
--> Processing Dependency: libcgroup for package: policycoreutils-python-2.5-34.el7.x86_64
--> Processing Dependency: libapol.so.4(VERS_4.0)(64bit) for package: policycoreutils-python-2.5-34.el7.x86_64
--> Processing Dependency: checkpolicy for package: policycoreutils-python-2.5-34.el7.x86_64
--> Processing Dependency: libqpol.so.1()(64bit) for package: policycoreutils-python-2.5-34.el7.x86_64
--> Processing Dependency: libapol.so.4()(64bit) for package: policycoreutils-python-2.5-34.el7.x86_64
--> Running transaction check
---> Package audit-libs-python.x86_64 0:2.8.5-4.el7 will be installed
---> Package checkpolicy.x86_64 0:2.5-8.el7 will be installed
---> Package libcgroup.x86_64 0:0.41-21.el7 will be installed
---> Package libsemanage-python.x86_64 0:2.5-14.el7 will be installed
---> Package python-IPy.noarch 0:0.75-6.el7 will be installed
---> Package setools-libs.x86_64 0:3.3.8-4.el7 will be installed
--> Finished Dependency Resolution

Dependencies Resolved

============================================================================================================================================================================
 Package                                    Arch                       Version                              Repository                                                 Size
============================================================================================================================================================================
Installing:
 container-selinux                          noarch                     2:2.107-3.el7                        /container-selinux-2.107-3.el7.noarch                      40 k
Installing for dependencies:
 audit-libs-python                          x86_64                     2.8.5-4.el7                          Local                                                      77 k
 checkpolicy                                x86_64                     2.5-8.el7                            Local                                                     295 k
 libcgroup                                  x86_64                     0.41-21.el7                          Local                                                      66 k
 libsemanage-python                         x86_64                     2.5-14.el7                           Local                                                     113 k
 policycoreutils-python                     x86_64                     2.5-34.el7                           Local                                                     457 k
 python-IPy                                 noarch                     0.75-6.el7                           Local                                                      32 k
 setools-libs                               x86_64                     3.3.8-4.el7                          Local                                                     620 k

Transaction Summary
============================================================================================================================================================================
Install  1 Package (+7 Dependent packages)

Total size: 1.7 M
Total download size: 1.6 M
Installed size: 5.3 M
Is this ok [y/d/N]: y
Downloading packages:
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Total                                                                                                                                        68 MB/s | 1.6 MB  00:00:00     
Running transaction check
Running transaction test
Transaction test succeeded
Running transaction
  Installing : setools-libs-3.3.8-4.el7.x86_64                                                                                                                          1/8
  Installing : libcgroup-0.41-21.el7.x86_64                                                                                                                             2/8
  Installing : audit-libs-python-2.8.5-4.el7.x86_64                                                                                                                     3/8
  Installing : python-IPy-0.75-6.el7.noarch                                                                                                                             4/8
  Installing : libsemanage-python-2.5-14.el7.x86_64                                                                                                                     5/8
  Installing : checkpolicy-2.5-8.el7.x86_64                                                                                                                             6/8
  Installing : policycoreutils-python-2.5-34.el7.x86_64                                                                                                                 7/8
  Installing : 2:container-selinux-2.107-3.el7.noarch                                                                                                                   8/8
  Verifying  : checkpolicy-2.5-8.el7.x86_64                                                                                                                             1/8
  Verifying  : libsemanage-python-2.5-14.el7.x86_64                                                                                                                     2/8
  Verifying  : 2:container-selinux-2.107-3.el7.noarch                                                                                                                   3/8
  Verifying  : python-IPy-0.75-6.el7.noarch                                                                                                                             4/8
  Verifying  : policycoreutils-python-2.5-34.el7.x86_64                                                                                                                 5/8
  Verifying  : audit-libs-python-2.8.5-4.el7.x86_64                                                                                                                     6/8
  Verifying  : libcgroup-0.41-21.el7.x86_64                                                                                                                             7/8
  Verifying  : setools-libs-3.3.8-4.el7.x86_64                                                                                                                          8/8

Installed:
  container-selinux.noarch 2:2.107-3.el7                                                                                                                                    

Dependency Installed:
  audit-libs-python.x86_64 0:2.8.5-4.el7           checkpolicy.x86_64 0:2.5-8.el7       libcgroup.x86_64 0:0.41-21.el7          libsemanage-python.x86_64 0:2.5-14.el7      
  policycoreutils-python.x86_64 0:2.5-34.el7       python-IPy.noarch 0:0.75-6.el7       setools-libs.x86_64 0:3.3.8-4.el7      

Complete!
```
- Docker 패키지를 설치합니다. (Community Edition)

```TEXT
#yum install docker-ce
```
```bash
Loaded plugins: product-id, search-disabled-repos, subscription-manager

This system is not registered with an entitlement server. You can use subscription-manager to register.

Resolving Dependencies
--> Running transaction check
---> Package docker-ce.x86_64 3:19.03.9-3.el7 will be installed
--> Processing Dependency: containerd.io >= 1.2.2-3 for package: 3:docker-ce-19.03.9-3.el7.x86_64
--> Processing Dependency: libseccomp >= 2.3 for package: 3:docker-ce-19.03.9-3.el7.x86_64
--> Processing Dependency: docker-ce-cli for package: 3:docker-ce-19.03.9-3.el7.x86_64
--> Processing Dependency: libseccomp.so.2()(64bit) for package: 3:docker-ce-19.03.9-3.el7.x86_64
--> Running transaction check
---> Package containerd.io.x86_64 0:1.2.13-3.2.el7 will be installed
---> Package docker-ce-cli.x86_64 1:19.03.9-3.el7 will be installed
---> Package libseccomp.x86_64 0:2.3.1-4.el7 will be installed
--> Finished Dependency Resolution

Dependencies Resolved

============================================================================================================================================================================
 Package                                  Arch                              Version                                       Repository                                   Size
============================================================================================================================================================================
Installing:
 docker-ce                                x86_64                            3:19.03.9-3.el7                               docker-ce-stable                             24 M
Installing for dependencies:
 containerd.io                            x86_64                            1.2.13-3.2.el7                                docker-ce-stable                             25 M
 docker-ce-cli                            x86_64                            1:19.03.9-3.el7                               docker-ce-stable                             38 M
 libseccomp                               x86_64                            2.3.1-4.el7                                   Local                                        56 k

Transaction Summary
============================================================================================================================================================================
Install  1 Package (+3 Dependent packages)

Total download size: 88 M
Installed size: 360 M
Is this ok [y/d/N]: y
Downloading packages:
warning: /var/cache/yum/x86_64/7Server/docker-ce-stable/packages/containerd.io-1.2.13-3.2.el7.x86_64.rpm: Header V4 RSA/SHA512 Signature, key ID 621e9f35: NOKEY-:--:-- ETA
Public key for containerd.io-1.2.13-3.2.el7.x86_64.rpm is not installed
(1/3): containerd.io-1.2.13-3.2.el7.x86_64.rpm                                                                                                       |  25 MB  00:00:01     
(2/3): docker-ce-cli-19.03.9-3.el7.x86_64.rpm                                                                                                        |  38 MB  00:00:00     
(3/3): docker-ce-19.03.9-3.el7.x86_64.rpm                                                                                                            |  24 MB  00:00:06     
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Total                                                                                                                                        14 MB/s |  88 MB  00:00:06     
Retrieving key from https://download.docker.com/linux/centos/gpg
Importing GPG key 0x621E9F35:
 Userid     : "Docker Release (CE rpm) <docker@docker.com>"
 Fingerprint: 060a 61c5 1b55 8a7f 742b 77aa c52f eb6b 621e 9f35
 From       : https://download.docker.com/linux/centos/gpg
Is this ok [y/N]: y
Running transaction check
Running transaction test
Transaction test succeeded
Running transaction
  Installing : libseccomp-2.3.1-4.el7.x86_64                                                                                                                            1/4
  Installing : containerd.io-1.2.13-3.2.el7.x86_64                                                                                                                      2/4
  Installing : 1:docker-ce-cli-19.03.9-3.el7.x86_64                                                                                                                     3/4
  Installing : 3:docker-ce-19.03.9-3.el7.x86_64                                                                                                                         4/4
  Verifying  : 1:docker-ce-cli-19.03.9-3.el7.x86_64                                                                                                                     1/4
  Verifying  : libseccomp-2.3.1-4.el7.x86_64                                                                                                                            2/4
  Verifying  : 3:docker-ce-19.03.9-3.el7.x86_64                                                                                                                         3/4
  Verifying  : containerd.io-1.2.13-3.2.el7.x86_64                                                                                                                      4/4

Installed:
  docker-ce.x86_64 3:19.03.9-3.el7                                                                                                                                          

Dependency Installed:
  containerd.io.x86_64 0:1.2.13-3.2.el7                      docker-ce-cli.x86_64 1:19.03.9-3.el7                      libseccomp.x86_64 0:2.3.1-4.el7                     
```
<br>

---
## Check Version
- Docker 데몬을 실행 한 후, 버전을 확인합니다.

```TEXT
#systemctl start docker
```
```TEXT
#docker version
```
```go
Client: Docker Engine - Community
 Version:           19.03.9
 API version:       1.40
 Go version:        go1.13.10
 Git commit:        9d988398e7
 Built:             Fri May 15 00:25:27 2020
 OS/Arch:           linux/amd64
 Experimental:      false

Server: Docker Engine - Community
 Engine:
  Version:          19.03.9
  API version:      1.40 (minimum version 1.12)
  Go version:       go1.13.10
  Git commit:       9d988398e7
  Built:            Fri May 15 00:24:05 2020
  OS/Arch:          linux/amd64
  Experimental:     false
 containerd:
  Version:          1.2.13
  GitCommit:        7ad184331fa3e55e52b890ea95e65ba581ae3429
 runc:
  Version:          1.0.0-rc10
  GitCommit:        dc9208a3303feef5b3839f4323d9beb36df0a9dd
 docker-init:
  Version:          0.18.0
  GitCommit:        fec3683
```
!!! tip
    \#docker -v 명령어를 이용해도 버전을 확인할 수 있습니다.  
