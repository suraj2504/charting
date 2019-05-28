import { Component, VERSION, ViewChild, ElementRef, OnInit } from '@angular/core';
import { HttpClientModule, HttpClient, HttpRequest, HttpResponse, HttpEventType } from '@angular/common/http';
// import 'chartjs-plugin-annotation';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    @ViewChild('myCanvas')
    title = 'charting';
    percentDone: number;
    uploadSuccess = false;
    allSeries = [];
    allSeriesMap = {};
    canvas: ElementRef;
    context: CanvasRenderingContext2D;
    chartType = 'line';
    chartData: any[];
    chartLabels: any[];
    chartColors: any[];
    chartOptions: any;
    selectedSeries = '';
    seriesData = [];
    categoryData = [];

    constructor(
        private http: HttpClient,
    ) { }

    startController = () => {
        this.chartColors = [{
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderColor: 'rgba(0, 0, 0, 1)'
        }];
    }

    setLineChartData = (selectedSeries) => {
        this.seriesData = this.allSeriesMap[selectedSeries].y;
        this.categoryData = this.allSeriesMap[selectedSeries].x;
        const steps = this.setStepSize(this.allSeriesMap[selectedSeries].y);
        this.chartOptions = {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        stepSize: steps
                    }
                }]
            }
        };
        this.chartData = [{
            data: this.seriesData,
            label: selectedSeries,
            fill: false
        }];
        this.chartLabels = this.categoryData;
    }

    setStepSize = (series) => {
        let max = 0;
        series.forEach(each => {
            if (max < each * 1) {
                max = each * 1;
            }
        });
        const stpes = Math.ceil(max / 5);
        return stpes;
    }

    upload(files: File[]) {
        this.changeListener(files);
    }

    public changeListener(files) {
        if (files && files.length > 0) {
            const file: File = files.item(0);
            const fileReader = new FileReader();
            fileReader.readAsText(file, 'UTF-8');
            fileReader.onload = (e) => {
                const csv: any = fileReader.result;
                const allTextLines = csv.split(/\r|\n|\r/);
                allTextLines.forEach((line) => {
                    const rowData = line.split(',');
                    this.allSeries.push(rowData[0]);
                    this.allSeriesMap[rowData[0]] = {
                        x: [],
                        y: []
                    };
                    const seriesData = rowData.slice(1, rowData.length - 1);
                    seriesData.forEach(series => {
                        const seriesValue = series.split('|');
                        this.allSeriesMap[rowData[0]].x.push(seriesValue[0]);
                        this.allSeriesMap[rowData[0]].y.push(seriesValue[1]);
                    });
                });
                console.log(this.allSeries);
                console.log(this.allSeriesMap);
                this.uploadSuccess = true;
                this.selectedSeries = this.allSeries[0];
                this.setLineChartData(this.selectedSeries);

            };
            fileReader.onerror = (error) => {
                console.log(error);
            };
        }
    }

    basicUpload(files: File[]) {
        const formData = new FormData();
        Array.from(files).forEach(f => formData.append('file', f));
        this.http.post('https://file.io', formData)
            .subscribe(event => {
                console.log('done');
            });
    }

    ngOnInit() {
        this.startController();
    }
}
