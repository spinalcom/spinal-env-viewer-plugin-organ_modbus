// import ServiceCDE from "spinal-env-viewer-plugin-documentation-service";
// import bimObjectService from 'spinal-env-viewer-plugin-bimobjectservice';
import {
  SPINAL_RELATION_PTR_LST_TYPE
} from "spinal-env-viewer-graph-service";

class FileSystemExplorer {
  constructor() {
    this.spinalSystem = window.spinal.spinalSystem;
    this.pathForgeFile = this.spinalSystem.getPath();
  }

  getDrivePathRoot() {
    var user = this.spinalSystem.getUser();
    var home = "/__users__/" + user.username;
    this.currentPath = home;
    var route = {};
    route.name = "home";
    route.path = home;
    return route;
  }
  createDriveRoute(path, file) {
    var name = "/ " + file.name;
    var mypath = path + "/" + file.name;
    var route = {};
    route.name = name;
    route.path = mypath;
    return route;
  }
  loadDrivePath(currentPath) {
    let tabDisplay = [];
    return this.spinalSystem.load(currentPath).then(directory => {
      for (let i = 0; i < directory.length; i++) {
        const element = directory[i];
        let obj = {
          name: element.name.get(),
          type: element._info.model_type.get(),
          serverid: element._server_id,
          path: currentPath + "/" + element.name.get()
        };
        tabDisplay.push(obj);
      }
      return tabDisplay;
    });
  }
  async getDirectory(selectedNode) {
    if (selectedNode != undefined) {
      const fileNode = await selectedNode.getChildren("hasFiles");
      if (fileNode.length == 0) {
        return undefined;
      } else {
        let directory = await fileNode[0].getElement();
        return (directory);
      }
    }
  }
  async getNbChildren(selectedNode) {
    const fileNode = await selectedNode.getChildren("hasFiles");
    return fileNode.length;
  }
  async createDirectory(selectedNode) {
    let nbNode = await this.getNbChildren(selectedNode);
    if (nbNode == 0) {
      let myDirectory = new Directory();
      let node = await selectedNode.addChild(
        myDirectory,
        'hasFiles',
        SPINAL_RELATION_PTR_LST_TYPE
      );
      node.info.name.set("[Files]");
      node.info.type.set("SpinalFiles");
      return myDirectory;
    } else {
      return this.getDirectory(selectedNode);
    }
  }
  addFileUpload(directory, uploadFileList) {
    const files = [];

    for (let i = 0; i < uploadFileList.length; i++) {
      const element = uploadFileList[i];
      let filePath = new Path(element);
      let myFile = new File(element.name, filePath);
      directory.push(myFile);
      files.push(myFile);
    }

    return files
  }
  addFileDrive(directory, driveFileList, pathTab) {
    for (let i = 0; i < driveFileList.length; i++) {
      const driveFile = driveFileList[i];
      let test = this.checkInfinitInclusion(FileSystem._objects[driveFile
          .serverid],
        pathTab);
      test.then((res) => {
        if (res == false) {
          // return false
        } else {
          directory.push(FileSystem._objects[driveFile.serverid]);
          // return true
        }
      });
    }
  }
  getDigitalTwithePath() {
    return this.spinalSystem.getPath();
  }
  pathParse(path) {
    let arrayOfPath = path.split("/");
    let nameFile = arrayOfPath[arrayOfPath.length - 1];
    return nameFile;
  }
  callback(file) {
    return new Promise(resolve => {
      file._ptr.load(resolve);
    });
  }
  checkInfinitInclusion(file, pathTab) {
    let DigitalTwinPath = this.spinalSystem.getPath();
    let nameFile = this.pathParse(DigitalTwinPath);
    let _this = this;
    let tab = [];
    for (let j = 0; j < pathTab.length; j++) {
      const name = pathTab[j].name.substring(0, pathTab[j].name.length - 2);
      if (name == file.name.get()) {
        return Promise.resolve(false);
      }
    }
    if (file.name.get() == nameFile) {
      return Promise.resolve(false);
    } else if (file._info.model_type.get() === "Directory" || file._info
      .model_type.get() === "Synchronized Directory") {
      return this.callback(file).then((resdir) => {
        if (resdir.length > 0) {
          for (let i = 0; i < resdir.length; i++) {
            const file = resdir[i];
            tab.push(_this.checkInfinitInclusion(file, pathTab));
          }
          return Promise.all(tab).then((array) => {
            return !array.includes(false);
          });
        } else {
          return true;
        }
      });
    } else {
      return Promise.resolve(true);
    }
  }
  addDirectory(selectedNode) {
    console.log(selectedNode);
  }
  getIconFile(file) {
    let fileType;
    if (file.type != undefined) {
      fileType = file.type;
    } else {
      fileType = file._info.model_type.get();
    }
    if (fileType === "Directory") return "folder";
    else if (fileType === "Digital twin") return "location_city";
    else if (fileType === "Path") return "insert_drive_file";
    else if (fileType === "Synchronized Directory") return "folder_shared";
    else if (fileType === "HttpPath") return "file_copy";
    else return "not_listed_location";
  }

}
export const FileExplorer = new FileSystemExplorer();