import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { MdbCheckboxModule } from 'mdb-angular-ui-kit/checkbox';
import { MqttSocketService } from './mqtt/mqttsocket.service';
import { HeaderComponent } from './ui_components/header/header.component';
import { FooterComponent } from './ui_components/footer/footer.component';
import { RendererComponent } from './renderer/renderer.component';
import { MatSliderModule } from '@angular/material/slider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './ui_components/home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    RendererComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MdbCheckboxModule,
    MatSliderModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule, 
    MatButtonModule,
    BrowserAnimationsModule
  ],
  providers: [MqttSocketService],
  bootstrap: [AppComponent]
})
export class AppModule { }
