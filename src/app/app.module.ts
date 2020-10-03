import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { 
  FormatCostPipe, 
  FormatNumberPipe, 
  FormatProductionPipe,
  FormatScorePipe,
} from './pretty-number-pipe'
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
    FormatCostPipe,
    FormatNumberPipe,
    FormatProductionPipe,
    FormatScorePipe
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
