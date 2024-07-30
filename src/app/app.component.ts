import { CommonModule } from '@angular/common';
import { Component, AfterViewInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Chart,ChartModule } from 'angular-highcharts';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule,ChartModule],
  templateUrl: './app.component.html',
})


export class AppComponent implements AfterViewInit {
  chart: Chart;

  constructor() {
    this.chart = this.generateChart(10, 20, 30, 10, 30, 1, 2, 3, 1, 3);
  }

  ngAfterViewInit() {
    this.chart.ref$.subscribe(chart => {
      chart.reflow();
    });
  }

  generateChart(
    sp: number,
    cp: number,
    rp: number,
    np: number,
    nap: number,
    sc: number,
    cc: number,
    rc: number,
    nc: number,
    nac: number
  ): Chart {
    const [sw, cw, rw, nw, naw] = this.adjustW([sp, cp, rp, np, nap]);

    const chart = new Chart({
      chart: {
        type: 'bar',
        height: 100,
        width: 320,
        margin: 0,
        marginTop: 50,
        events: {
          render: function () {
            this.series.forEach((s) =>
              s.points.forEach((p: any) => (p.tooltipPos[0] += p.shapeArgs.height / 2))
            );
          },
        },
      },
      title: {
        text: undefined,
      },
      credits: {
        enabled: false,
      },
      xAxis: {
        visible: false,
        lineColor: 'transparent',
      },
      yAxis: {
        min: 0,
        reversed: true,
        lineColor: 'transparent',
        visible: false,
        title: {
          text: null,
        },
      },
      tooltip: {
        useHTML: true,
        padding: 5,
        outside: true,
        positioner: function(labelWidth, labelHeight, point) {
          // Get the chart position relative to the entire document
          const chartPosition = this.chart.pointer.getChartPosition();
          // Calculate the X position: center of the point
          let posX = chartPosition.left + point.plotX + this.chart.plotLeft - (labelWidth / 2);
          // Calculate the Y position: top of the chart area
          let posY = chartPosition.top + this.chart.plotTop - labelHeight;
          console.log({"Og posX": posX, "Og posY": posY});
          // If the chart is inside a table or another container, get the container's offset
          const container = this.chart.container.parentElement;
          const containerRect = container!.getBoundingClientRect();
          // Adjust positions based on the container's offset
          posX -= containerRect.left + window.scrollX;
          posY -= containerRect.top + window.scrollY;
          console.log({"posX": posX, "posY": posY});
          console.log("top--->",chartPosition.top)
          
          return {
            x: posX,
            y: chartPosition.top
          };
        },
        formatter: function () {
          const p = AppComponent.getP(sp, cp, rp, np, nap, this.series.name);
          const c = AppComponent.getC(sc, cc, rc, nc, nac, this.series.name);
          return AppComponent.getHTML(p, c, this.series.name);
        },
        borderColor: '#000',
        backgroundColor: '#fff',
        shadow: true,
        style: {
          fontSize: '12px',
          color: '#333',
        },
      },
      plotOptions: {
        column: {
          stacking: 'percent',
          pointWidth: 32,
          borderWidth: 0,
        },
        series: {
          animation: false,
          dataLabels: {
            enabled: true,
            useHTML: true,
            style: {
              color: '#333',
              fontSize: '10px',
            },
            overflow: 'justify',
            crop: false,
            verticalAlign: 'middle',
            allowOverlap: true,
            formatter: function () {
              const p = AppComponent.getP(sp, cp, rp, np, nap, this.series.name);
              const w = AppComponent.getW(sw, cw, rw, nw, naw, this.series.name);
              if (w === 0) {
                return null;
              }
              if (w > 9) {
                return AppComponent.getInsideHTML(p);
              } else {
                return AppComponent.getOutsideHTML(p);
              }
            },
          },
        },
      },
      legend: {
        enabled: false,
      },
      series: [
        {
          type: 'column',
          name: 's',
          data: [sw],
          borderWidth: 0,
          borderColor: 'red',
        },
        {
          type: 'column',
          name: 'c',
          data: [cw],
          borderWidth: 0,
          borderColor: 'blue',
        },
        {
          type: 'column',
          name: 'r',
          data: [rw],
          borderWidth: 0,
          borderColor: 'yellow',
        },
        {
          type: 'column',
          name: 'n',
          data: [nw],
          borderWidth: 0,
          borderColor: 'green',
        },
        {
          type: 'column',
          name: 'na',
          data: [naw],
          borderWidth: 0,
          borderColor: 'pink',
        },
      ],
    });

    return chart;
  }

  adjustW(values: number[]): [number, number, number, number, number] {
    let ovs: number = values.reduce((sum, value) => sum + value, 0);
    const hasOverlappingValues: boolean = values.some((value) => value !== 0 && value < 6);
    if (!hasOverlappingValues || ovs !== 100) {
      return values as [number, number, number, number, number];
    }
    const adjustedList: number[] = values.map((value) =>
      value === 0 ? 0 : Math.max(value, 6)
    );
    let currentSum: number = adjustedList.reduce((sum, value) => sum + value, 0);
    while (currentSum > 100) {
      adjustedList.forEach((value, index) => {
        if (value > 6 && currentSum > 100) {
          adjustedList[index]--;
          currentSum--;
        }
      });
    }
    return adjustedList as [number, number, number, number, number];
  }

  static getW(sw: number, cw: number, rw: number, nw: number, naw: number, seriesName: string): number {
    switch (seriesName) {
      case 's':
        return sw;
      case 'c':
        return cw;
      case 'r':
        return rw;
      case 'n':
        return nw;
      case 'na':
        return naw;
      default:
        return 0;
    }
  }

  static getC(sc: number, cc: number, rc: number, nc: number, nac: number, seriesName: string): number {
    switch (seriesName) {
      case 's':
        return sc;
      case 'c':
        return cc;
      case 'r':
        return rc;
      case 'n':
        return nc;
      case 'na':
        return nac;
      default:
        return 0;
    }
  }

  static getP(sp: number, cp: number, rp: number, np: number, nap: number, seriesName: string): number {
    switch (seriesName) {
      case 's':
        return sp;
      case 'c':
        return cp;
      case 'r':
        return rp;
      case 'n':
        return np;
      case 'na':
        return nap;
      default:
        return 0;
    }
  }

  static getHTML(p: number, c: number, s: string): string {
    return `<span>
              ${s} = ${p}%
              <br/># = ${c}
            </span>`;
  }

  static getInsideHTML(v: number): string {
    return `<span style='background: white; border-radius: 2px; padding: 2px 3px; margin-top:3px; margin-left: -0.5px; font-weight: normal'>
              ${v}%
            </span>`;
  }

  static getOutsideHTML(v: number): string {
    return `<div style='display: flex; justify-content: center; align-items: center; flex-direction: column'>
              <div style='width: 5px; height: 5px; background: #333333; border-radius: 50%; margin-top: 32px'></div>
              <div style='border-left: 1px solid #333333; height: 16px;'></div>
              <span style='font-weight: normal; letter-spacing: 0px'>
              ${v}%
              </span>
            </div>`;
  }
}
