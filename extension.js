var vscode = require('vscode');
var execSync = require('child_process').execSync;
var fs = require('fs');
var path = require('path');
var os = require('os');

function localExecCmd(cmd, args, outputChannel, cb) {
    try {
        var cp = require('child_process').spawn(cmd, args);

        cp.stdout.on('data', function (data) {
            if (outputChannel) {
                outputChannel.append(String(data));
                outputChannel.show();
            }
        });

        cp.stderr.on('data', function (data) {
            if (outputChannel) outputChannel.append(String(data));
        });

        cp.on('close', function (code) {
            if (cb) {
                if (0 == code) {
                    cb();
                } else {
                    var e = new Error("External command failed");
                    e.stack = "exit code: " + code;
                    cb(e);
                }
            }
        });
    } catch (e) {
        e.stack = "ERROR: " + e;
        if (cb) cb(e);
    }
}

function cloneDockerRepo(context) {
    var repoName = 'iotdev-docker';
    var repoPath = context.extensionPath + '/' + repoName;
    if (fs.existsSync(repoPath)) {
        console.log('repo already exists');
        try {
            var cdCmd = os.platform() === 'win32' ? 'cd /d ' : 'cd ';
            var log = execSync(cdCmd + repoPath + ' && git pull');
            console.log(log);
        } catch (e) {
            console.log(e);
        }
    } else {
        console.log('repo not exists and clone the repo');
        console.log('extentsion path: ' + context.extensionPath);
        try {
            var log = execSync('git clone https://github.com/yungez/iotdev-docker.git ' + repoPath);
            console.log(log);
        } catch (e) {
            console.log(e);
        }
    }
}

function activate(context) {
    console.log('Congratulations, your extension "azure-iot-development" is now active!');

    var outputChannel = vscode.window.createOutputChannel("Azure IoT build");
    let build = vscode.commands.registerCommand('extension.build', function () {
        cloneDockerRepo(context);

        var configPath = path.join(vscode.workspace.rootPath, '/config.json');
        if (fs.existsSync(configPath)) {
            delete require.cache[configPath];
            var config = require(configPath);

            var repoName = 'iotdev-docker';
            var repoPath = context.extensionPath + '/' + repoName;
            var mainPath = os.platform() === 'win32' ? repoPath + '/main.bat' : repoPath + '/main.sh';
            var workingdir = config.workingdir ? config.workingdir : vscode.workspace.rootPath;
            var builddirname = config.builddir ? config.builddir : 'build';
            var buildpath = path.join(workingdir, builddirname);
            if (!fs.existsSync(buildpath)) {
                fs.mkdirSync(buildpath);
            }

            console.log(config.device + '--' + workingdir + '--' + builddirname);
            if (os.platform() === 'win32') {
                localExecCmd(mainPath, ['build', '--device', config.device, '--workingdir', workingdir, '--builddir', builddirname], outputChannel);
            } else {
                localExecCmd('bash', [mainPath, 'build', '--device', config.device, '--workingdir', workingdir, '--builddir', builddirname], outputChannel);
            }
        } else {
            vscode.window.showErrorMessage('config.json does not exist.');
            console.log('config file does not exist');
        }
    });

    let deploy = vscode.commands.registerCommand('extension.deploy', function () {
        cloneDockerRepo(context);

        var configPath = path.join(vscode.workspace.rootPath, '/config.json');
        if (fs.existsSync(configPath)) {
            delete require.cache[configPath];
            var config = require(configPath);

            var repoName = 'iotdev-docker';
            var repoPath = context.extensionPath + '/' + repoName;
            var mainPath = os.platform() === 'win32' ? repoPath + '/main.bat' : repoPath + '/main.sh';
            var workingdir = config.workingdir ? config.workingdir : vscode.workspace.rootPath;
            var srcpath = config.srcpath ? config.srcpath : vscode.workspace.rootPath;
            var destdir = config.destdir ? config.destdir : '/home/' + config.username;
            if (os.platform() === 'win32') {
                localExecCmd(mainPath, ['deploy', '--device', config.device, '--workingdir', workingdir,
                    '--deviceip', config.deviceip, '--username', config.username, '--password', config.password,
                    '--srcpath', srcpath, '--destdir', destdir], outputChannel);
            } else {
                localExecCmd('bash', [mainPath, 'deploy', '--device', config.device, '--workingdir', workingdir,
                    '--deviceip', config.deviceip, '--username', config.username, '--password', config.password,
                    '--srcpath', srcpath, '--destdir', destdir], outputChannel);
            }
        } else {
            vscode.window.showErrorMessage('config.json does not exist.');
            console.log('config file does not exist');
        }
    });

    context.subscriptions.push(build);
    context.subscriptions.push(deploy);
}
exports.activate = activate;

function deactivate() {
}
exports.deactivate = deactivate;