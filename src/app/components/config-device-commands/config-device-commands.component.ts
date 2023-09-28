import { NgForOf, NgIf } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DeviceService } from '@services';
import { ButtonComponent } from '../button/button.component';
import { MatIconModule } from '@angular/material/icon';
import { DialogRef } from '@angular/cdk/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { UtilsService } from 'src/app/services/utils/utils.service';

@Component({
  selector: 'app-config-device-commands',
  standalone: true,
  imports: [FormsModule, MatSelectModule, NgForOf, MatInputModule, ButtonComponent, MatIconModule, NgIf],
  templateUrl: './config-device-commands.component.html',
  styleUrls: ['./config-device-commands.component.scss']
})

export class ConfigDeviceCommandsComponent implements OnInit {
  AvaCommands: any[]=[];
  paramTextActive: boolean = false;
  propSendCommand = {
    stepExec: -1,
    execparam: null
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: DialogRef<ConfigDeviceCommandsComponent>,
    private _device: DeviceService,
    private _utils: UtilsService
  ) {}

  ngOnInit(): void {
    this.foundAvaCommands();
  }

  foundAvaCommands() {
    this._device.getfoundAvaCommands().subscribe((data: any) => {
        if (data) {
            this.AvaCommands = data;
        }
    });
  }

  selectCommand(commandId: number) {
    // Verificar si existe algún elemento en AvaCommands que cumple con las condiciones dadas
    const paramActive = this.AvaCommands.some(avaCommand => avaCommand.stepparam === 1 && avaCommand.stepexec === commandId);
    this.paramTextActive = paramActive;
  
    if (!this.paramTextActive) {
      this.propSendCommand.execparam = null;
    }
  }
  
  
  sendCommandDevice() {
    if (typeof(this.data.deviceId) !== undefined) {
      const deviceId = this.data.deviceId;

      this._device.executeParamDevice({
          stepexec: this.propSendCommand.stepExec,
          deviexec: deviceId,
          execparam: this.propSendCommand.execparam
      }).subscribe((data: any) => {
        this._utils.matSnackBar('Comando enviado.', 'ok');
      });
    }
  }

  dialogClose() {
    this.dialogRef.close();
  }
}
