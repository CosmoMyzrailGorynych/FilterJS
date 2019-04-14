/* eslint-disable func-style */
/* eslint-disable no-empty */
/* eslint-disable no-nested-ternary */
/* eslint-disable max-params */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-use-before-define */
/* eslint-disable no-bitwise */
/**
 ## Median filter
 Espoo, Finland, November 2014
 Petri Leskinen, 
 petri.leskinen@icloud.com
 http://pixelero.wordpress.com/
 MIT license
 
 Simple example of usage in javascript:
 
 ```js
 // grab the pixels:
 var imageData = context.getImageData(0, 0, w, h);
 // clear area:
 context.clearRect (0, 0, canvas.width, canvas.height);
 // replace with filtered image:
 context.putImageData(convertImage(imageData), 0, 0);
```
 */

var MedianFilter = function(options) {
    options = options || {};
    console.log(options);
    //  Mask Dimensions:
    this.maskHeight = options.size || 9;
    this.maskWidth = options.size || 9;
    
    this.CIRCULAR = 'circular';
    this.RECTANGULAR = 'rectangular';
    this.DIAMOND = 'diamond';

    this.shape = options.shape || this.RECTANGULAR;

    //    controls which item to pick from the sorted order:
    //    default    0.5 = median
    //            0.0 = min
    //            1.0 = max
    
    this.kth = options.percentile !== void 0? Math.max(0, Math.min(options.percentile, 1)) : 0.5;
    
    this.FAST = 'fast';
    this.QUALITY = 'quality';
    
    this.mode = options.highQuality? this.QUALITY : this.FAST;
    
    this.NUMCLUSTERS = 64;
    
    this.convertImage = function (imageData) {
        
        var {data} = imageData;
        var w = imageData.width,
            h = imageData.height;
        
        //    first analyze the data
        var hs= this.calculateHistograms(data),
            bins=this.NUMCLUSTERS;
        
        hs[0]=this.blurHistogram(hs[0]);
        hs[1]=this.blurHistogram(hs[1]);
        hs[2]=this.blurHistogram(hs[2]);
        
        //    histograms of how values of each channel are distributed:
        //    note: this is a modified version: it doesn't equalize the channels,
        //    but tries to equalize their sum:
        var tst= this.equalizeHistogramSum(hs[0],hs[1],hs[2], bins),
            [rarr, garr, barr] = tst;
        
        /*
        //    equalize by channels:
        var rarr=this.equalizeHistogram(hs[0], bins),
            garr=this.equalizeHistogram(hs[1], 2*bins),
            barr=this.equalizeHistogram(hs[2], bins);
        */
        
        
        /*  element: filter mask consisting of 0:s and 1:s:
         001100
         011110
         111111
         111111
         011110
         001100
         */
        var element;
        switch (this.shape) {
            case this.DIAMOND:
                element=this.getDiamondMask(this.maskWidth,this.maskHeight);
                break;
            
            case this.CIRCULAR:
                element=this.getCircularMask(this.maskWidth,this.maskHeight);
                break;
               
            default: // RECTANGULAR
                element=this.getRectangleMask(this.maskWidth,this.maskHeight);
        }
        
        /*  mask: an array of arrays consisting of information of row elements
         where does it end, its y-position, and length
        001100 -> [end=4,y=0,length=2]
         011110 -> [end=5,y=1,length=4]
        111111 -> [end=6,y=2, length=6]
         */
        var mask=this.maskToArray(element);
        
        //  empty filtering, let's nothing !
        if (mask.length === 0) {
            return imageData;
        }
        
        /*    unnecessery try to smoothen the output by extra addition of nearby values */
        if (this.mode === this.FAST) {
            if (this.maskWidth>3 && this.maskHeight>>3) {
                const i=this.maskWidth>>1, 
                      j=this.maskHeight>>1;
                // mask.push([i+1,j-1,3]);
                mask.push([i+1,j,3]);
                // mask.push([i+1,j+1,3]);
            }
        }
        
        //  each pixel = 4 elements in image data [r,g,b,a]
        //    scale start positions by 4
        for (let i=0; i<mask.length;) {mask[i++][0]*=4;}
        
        //  padding: how much extra space is needed around the edges of image:
        var padding = element[0].length>>1,
        //    ysize is the largest y-coordinate of the mask:
            ysize=mask[0][1];
        for (let i=1; i<mask.length; i++) {
            if (mask[i][1]>ysize) {ysize=mask[i][1];}
        }
        ysize++;
        
        
        //  evalPixel: a function giving the actual value of how to sort the pixels
        //        by lightness:
        // var evalPixel = function (r,g,b) { return (5*g+3*r+b)>>2; };
        //        by average;
        // var evalPixel = function (r,g,b) { return (g+r+b)>>3; };
        //        by equalized average:
        var evalPixel = function (r,g,b) { return rarr[r]+garr[g]+barr[b]; };
        
        var rows=new Array(ysize),
        //    yNext: the number of the next line to read:
            yNext=-(ysize>>1);
        
        //    read first lines: rows[0]â‰ˆ[] !
        for (let i=1; i<ysize; i++) {
            rows[i]=this.getRow(data,yNext++,w,h,padding);
        }
        
        //    initialize the histogram:
        //    ( supposed that evalPixel(0,0,0) = 0 )
        var pxl = evalPixel(255,255,255)+1,
            hst=(this.mode===this.FAST) ?
                new MedianHistogramFast(pxl) :
                new MedianHistogram(pxl);
        
        //    parameter of where to write the pixel data to image 0...width*heigth-1
        var id=0;
        
        
        //    Iterate through the lines of the image:
        for (var y=0; y<h; y++) {
            
            //    removes: an array holding the pixel data to be removed
            //    removes[0] - removes after 1 loop
            //    removes[1] - after 2 loops etc...
            var removes = this.get2D(0,2*padding+1,Array);
            var i, j, k, r, g, b, x;
            
            //  remove uppermost row and add a new one:
            rows.shift();
            rows.push(this.getRow(data,yNext++,w,h,padding));
            
            //  clear the histogram:
            hst.clear();
            
            //  Initialize the histogram by entries in the form of element:
            for (i=0, x=0; i<element.length; i++) {
                for (j=0; j<element[i].length; j++) {
                    if (element[i][j]===1) {
                        k=j<<2;
                        r=rows[i][k++];
                        g=rows[i][k++];
                        b=rows[i][k];
                        pxl=evalPixel(r,g,b);
                        removes[j].push(pxl);
                        hst.addItem(pxl, r,g,b);
                        x++;
                    }
                }
            }
            
            //  write the first, leftmost pixel of a row:
            pxl=hst.initMedian(x*this.kth);
            data[id++]=pxl[0];
            data[id++]=pxl[1];
            data[id]=pxl[2];
            id+=2;
            
            //  loop through the rest of the row:
            for (x=4; x<4*w; x+=4) {
                
                //  remove (left edge) elements from histogram:
                hst.removeItems(removes.shift());
                removes.push([]);
                
                //  add (right edge) pixels to histogram:
                for (i=0; i<mask.length; i++) {
                    j=x+mask[i][0];
                    k=mask[i][1];
                    r=rows[k][j++];
                    g=rows[k][j++];
                    b=rows[k][j];
                    
                    //    count the index/key value for color:
                    pxl=rarr[r]+garr[g]+barr[b];
                    //    add by lifetime:
                    removes[mask[i][2]].push(pxl);
                    //    add to histogram:
                    hst.addItem(pxl, r,g,b);
                }
                
                //  set current pixel to median value:
                hst.setMedian(data, id);
                id += 4;
                
            }
        }
        
        //  That's all folks!
        return imageData;
    };
    
    
    //    now i'm using only the 'repeat' mode:
    this.getRow = function(data,y,w,h,padding) {
        return this.getRowRepeat(data,y,w,h,padding);
    };
    
    //  at the edge this repeat the sidemost pixel
    //  e.g. pixel[-3]=pixel[-2]=pixel[-1] = pixel[0]
    this.getRowRepeat = function(data,y,w,h,padding) {
        // reflect y to range 0...h-1:
        y = y<0 ? 0 : (y>=h ? h-1 : y);
        
        //  grab pixel from data:
        var arr=data.subarray(4*w*y,4*w*(y+1)-1),
        row= new Uint8ClampedArray((w+2*padding)<<2);
        row.set(arr, padding<<2);
        
        //  pad to start of array:
        for (let j=(padding+0)<<2, k=j-4; k>-1;) {
            const tmp=row.subarray(j,j+3);
            row.set(tmp,k);
            k-=4;
        }
        
        //  pad to end of array:
        for (let j=(w+padding)*4, k=j-4; j<row.length;) {
            const tmp=row.subarray(k,k+3);
            row.set(tmp,j);
            j+=4;
        }
        return row;
    };
    
    //  at the edges this reflects the pixels outside the image area:
    //  e.g.    pixel[-1] = pixel[0]
    //          pixel[-2] = pixel[1]
    this.getRowReflect = function(data,y,w,h,padding) {
        // reflect y to range 0...h-1:
        y = y<0 ? -1-y : (y>=h ? 2*(h-1)-y+1 : y);
        
        //  grab pixel from data:
        var arr=data.subarray(4*w*y,4*w*(y+1)-1),
            row= new Uint8ClampedArray((w+2*padding)<<2);
        row.set(arr, padding<<2);
        
        //  pad to start of array:
        for (let j=(padding+0)<<2, k=j-4; k>-1;) {
            const tmp=row.subarray(j,j+3);
            row.set(tmp,k);
            k-=4; j+=4;
        }
        
        //  pad to end of array:
        for (let j=(w+padding)*4, k=j-4; j<row.length;) {
            const tmp=row.subarray(k,k+3);
            row.set(tmp,j);
            k-=4; j+=4;
        }
        return row;
    };
    
    this.get2D = function (x,y,C) {
        var arr= new Array(y);
        for (var i=0; i<y; i++) {
            arr[i]= x===0 ? new C() : new C(x);
        }
        return arr;
    };
    
    //    loops through an image, and adds rgb-values to corresponding histogram bins:
    this.calculateHistograms = function (data) {
        var rarr=new Uint32Array(256),
            garr=new Uint32Array(256),
            barr=new Uint32Array(256),
            N=5;
        //  in case of a very large image this could be sped up
        //  by sample only every 2nd, 3rd or Nth pixel: i+=6, i+=10, i+=2+4*N
        for (var i=0; i<data.length; i+=2+4*N) {
            rarr[data[i++]]++;
            garr[data[i++]]++;
            barr[data[i]]++;
        }
        return [rarr,garr,barr];
    };
    
    //    equalizes the histogram e.g. after all the bins should contain
    //        equal amount of data:
    this.equalizeHistogram = function(hst, bins) {
        var totalSum=0;
        for (let i=0; i<hst.length; i++) {
            totalSum += hst[i];
        }
        
        var m=totalSum/bins;
        
        var hst2=new Uint32Array(hst.length);
        
        for (var i=0, j=0, sum=0; i<hst.length; i++) {
            sum += hst[i];
            while (sum>m) {
                sum -=m;
                j++;
            }
            hst2[i]=j;
        }
        return hst2;
    };
    
    this.equalizeHistogramSum = function(rh,gh,bh, bins) {
        var totalSum=0, 
            N=rh.length;
        for (var i=0; i<N; i++) {
            totalSum += rh[i]+gh[i]+bh[i];
        }
        
        var m=totalSum/bins,
            sum=0,
            ir=0,
            ig=0,
            ib=0,
            j=0,
            r,g,b, min, max,
            rh2 = new Uint32Array(N),
            gh2 = new Uint32Array(N),
            bh2 = new Uint32Array(N);
        
        while (ir<N || ig<N || ib<N) {
            r= ir<N ? rh[ir] : 0;
            g= ig<N ? gh[ig] : 0;
            b= ib<N ? bh[ib] : 0;
            
            if (r<g) {
                min=r; max=g;
            } else {
                min=g; max=r;
            }
            
            if (b<min) {min=b;} else if (b>max) {max=b;}
            
            if (max>=0.9*(r+g+b)) {
                rh2[ir++]=
                gh2[ig++]=
                bh2[ib++]=j;
                sum += r+g+b;
            } else {
                
                if (r===min) {
                    rh2[ir++]=j;
                } else if (g===min) {
                    gh2[ig++]=j;
                } else {
                    bh2[ib++]=j;
                }
                if (r===max) {
                    rh2[ir++]=j;
                } else if (g===max) {
                    gh2[ig++]=j;
                } else {
                    bh2[ib++]=j;
                }
                sum += min+max;
            }
            while (sum>m) { sum -=m; j++; }
                
        }
        return [rh2,gh2,bh2];
    };
    
    
    //    applies a running average of three [previous,this,next] to an array:
    this.blurHistogram = function(hst) {
        var hst2=new Uint32Array(hst.length);
        hst2[0]=hst2[1]=1.5*hst[0];
        var i=hst.length-1;
        hst2[i]=hst[i-1]=1.5*hst[i];
        for (i=1; i<hst.length-1; i++) {
            hst2[i-1]=hst2[i]=hst2[i+1]=hst[i];
        }
        for (i=0; i<hst2.length; i++) {
            hst2[i] /= 3;
        }
        return hst2;
    };
    
    /*  Returns a rectangular shape mask of x by y,
     e.g. 2d-array consisting of ones:
            11111
            11111
            11111
            11111
            11111
     */
    this.getRectangleMask= function(x,y) {
        var arr2=new Array(x);
        for (let i=0; i<x; arr2[i++]=1){}
        var arr=new Array(y);
        for (let i=0; i<y; arr[i++]=arr2){}
        return arr;
    };
    
    /*  Returns a circular shape mask:
     00011000
     01111110
     01111110
     11111111
     11111111
     01111110
     01111110
     00011000
     */
    this.getCircularMask= function(x,y) {
        var arr=this.get2D(x,y,Int8Array),
            cx=0.5*(x-1), 
            cy=0.5*(y-1),
            rx=0.5*(x-0.5), 
            ry=0.5*(y-0.5);
        rx *= rx; ry *= ry;
        for (var i=0; i<y; i++) {
            for (var j=0; j<x; j++) {
                arr[i][j]= (i-cy)*(i-cy)*rx+(j-cx)*(j-cx)*ry < rx*ry ? 1 : 0;
            }
        }
        return arr;
    };
    
    /*  Returns a diamond shape mask:
     0001000
     0011100
     0111110
     1111111
     0111110
     0011100
     0001000
     */
    this.getDiamondMask= function(x,y) {
        var arr=this.get2D(x,y,Int8Array),
            cx=0.5*(x-1), 
            cy=0.5*(y-1), 
            r=0.5*x*y+0.01;
        for (var i=0; i<y; i++) {
            for (var j=0; j<x; j++) {
                arr[i][j]= Math.abs(i-cy)*x+Math.abs(j-cx)*y <= r ? 1 : 0;
            }
        }
        return arr;
    };
    
    
    this.maskToArray= function (mask) {
        var res=[];
        for (var y=0, y0=0; y<mask.length; y++, y0++){
            var arr=this.countBinaries(mask[y]);
            for (var x=0; x<arr.length-1;) {
                var a=arr[x++], 
                b=arr[x++];
                // x-offset, y-offset, lifetime
                res.push([b-1, y, b-a-1]);
            }
        }
        return res;
    };
    
    //    analyzes an array of 0:s and 1:s
    //    [0,0,1,1,1,1,0,1,1] -> [ 2, 6, 7, 9 ]
    //    returns an array of positions where sequence of 0 turn to 1 or vise versa
    this.countBinaries = function (arr) {
        var last = 0,
            i = 0,
            res = [];
        while (i < arr.length) {
            while (arr[i] === last) {i++;}
            last = arr[i];
            res.push(i);
        }
        return res.length<2 ? [] : res;
    };
    
    /*    For testing only
    this.testMedian = function (size) {
        var hst=new MedianHistogram(size);
        var arr=[],sz=230;
        for (var i=0; i<sz;i++) {
            var x=(Math.random()*size)<<0;
            arr.push(x);
            hst.addItem(x,0,0,0);
        }
        
        var m1=this.calcMedian(arr).index,
        m2=hst.initMedian();
        
        for (var i=0; i<100; i++) {
            for (var j=0; j<10; j++) {
            var x=arr.shift();
            hst.removeItem(x);
            
            x=(Math.random()*size)<<0;
            arr.push(x);
            hst.addItem(x);
            }
            var m1=this.calcMedian(arr),
                m2=hst.getMedian().index;
            if (m1 != m2) { console.log(m1,m2); }
        }
    }
    
    this.calcMedian = function (arr) {
        var arr2=arr.slice();
        arr2.sort(function(a, b){return a-b});
        // console.log(arr2.join());
        return arr2[arr2.length>>1];
    }
    */
   return this;
};


function MedianHistogram(size) {
    
    this.init = function(size) {
        this.medianbin=0;
        this.medianindex=1;
        
        this.histogram = new Uint16Array(size);
        
        this.colors = [];
        for (var i=size; i>0;) {
            this.colors[--i]= new Uint32Array(3);
        }
    };
    
    this.init(size);
    
    this.addItem = function(index, r,g,b) {
        // if added value is below the median,
        //    decrease median's position
        if (index<this.medianbin) {
            this.medianindex--;
        }
        //    Adding an item is to increase the value of corresponding bin
        this.histogram[index]++;
        //    and to add color values:
        var c = this.colors[index];
        
        c[0] += r;
        c[1] += g;
        c[2] += b;
        
    };
    
    this.removeItem = function(index) {
        // if removed value is below the median,
        //    raise median's position
        if (index<this.medianbin) {
            this.medianindex++;
        }
        
        //    removing an entry is to decrease the number of entries by 1
        //    and subtract an average from the color bins:
        var c = this.colors[index];
        
        switch (this.histogram[index]) {
            case 1:
            //    case of one entries, empty the bin
                this.histogram[index] = 0;
                c[0]=c[1]=c[2]=0;
                break;
                
            case 2:
            //    case of two entries, divide colors by 2
                this.histogram[index] = 1;
                c[0] >>= 1;
                c[1] >>= 1;
                c[2] >>= 1;
                break;
                
            default:
            //    decrease value by one,
            //    subtract the average from color counts:
            var i=this.histogram[index]--,
                f=this.histogram[index]/i;
            
                c[0] *= f;
                c[1] *= f;
                c[2] *= f;
        }
    
    };
    
    //    remove an array of images:
    this.removeItems = function(arr) {
        for (var i=0; i<arr.length;) {this.removeItem(arr[i++]);}
    };
    
    //    set median to position k * (number of entries)
    //    e.g. Median if k=0.5
    this.initMedian = function (k) {
        this.medianbin = 0;
        this.medianindex = k>>0;
        return this.getMedian();
    };
    
    
    this.getMedian = function () {
        //    if needed, update index/bin to current median position:
        while (this.medianindex> this.histogram[this.medianbin]) {
            this.medianindex -= this.histogram[this.medianbin++];
        }
        while (this.medianindex<1) {
            this.medianindex += this.histogram[--this.medianbin];
        }

        
        //    return the value ...
        //    as an average of bin entries:
        
        var c=this.colors[this.medianbin];
        switch (this.histogram[this.medianbin]) {
            case 1:
                //    only 1 entry, return colors values as they are:
                return c;
            
            case 2:
                return [c[0]>>1,c[1]>>1,c[2]>>1];
                
            case 4:
                return [c[0]>>2,c[1]>>2,c[2]>>2];

            default:
                var f=1.0/this.histogram[this.medianbin];
                return [f*c[0],f*c[1],f*c[2]];
        }
        
    };
    
    //    same algorithms as in getMedian, but
    //    writes output directly to imageData array:
    this.setMedian = function (data,id) {
        //    if needed, update index/bin to current median position:
        while (this.medianindex> this.histogram[this.medianbin]) {
            this.medianindex -= this.histogram[this.medianbin++];
        }
        while (this.medianindex<1) {
            this.medianindex += this.histogram[--this.medianbin];
        }
        
        //    set the value ...
        //    as an average of bin entries:
        
        var c=this.colors[this.medianbin];
        switch (this.histogram[this.medianbin]) {
            case 1:
                //    only 1 entry, set color values as they are:
                data[id]=c[0];
                data[id+1]=c[1];
                data[id+2]=c[2];
                break;
                
            case 2:
                data[id]=c[0]>>1;
                data[id+1]=c[1]>>1;
                data[id+2]=c[2]>>1;
                break;
                
            case 4:
                data[id]=c[0]>>2;
                data[id+1]=c[1]>>2;
                data[id+2]=c[2]>>2;
                break;
                
            default:
                var f=1.0/this.histogram[this.medianbin];
                data[id] = f*c[0];
                data[id+1] = f*c[1];
                data[id+2] = f*c[2];
        }
        
    };
    
    
    this.clear = function() {
        this.init(this.histogram.length);
    };
    
    //    no used:
    this.getEntries = function () {
        var arr=[];
        this.entries = 0;
        for (var i=0; i<this.histogram.length; i++) {
            if (this.histogram[i]>0) {
                this.entries++;
                for (var j=0; j<this.histogram[i]; j++) {
                    arr.push(i);
                }
            }
        }
        this.initMedian();
        return arr;
    };
}

//    Faster implementation of histogram,
//    only the latest color sample is saved,
//    e.g. not averaged as with MedianHistogram()
function MedianHistogramFast(size) {   
    
    this.init = function(size) {
        this.histogram = new Uint16Array(size);
        this.colors = [];
        
        var i=size;
        while (i) {
            this.colors[--i]= new Uint8ClampedArray(3);
        }
        this.medianbin=0;
        this.medianindex=1;
    };
    
    this.init(size);
    
    
    this.addItem = function(index, r,g,b) {
        // if added value is below the median,
        //    decrease median's position
        if (index<this.medianbin) {
            this.medianindex--;
        }
        //    Adding an item is to increase the value of corresponding bin
        this.histogram[index]++;
        //    and to add color values:
        var c = this.colors[index];
        c[0] = r;
        c[1] = g;
        c[2] = b;
    };
    
    this.removeItem = function(index) {
        // if removed value is below the median,
        //    raise median's position
        if (index<this.medianbin) {this.medianindex++;}
        this.histogram[index]--;
    };
    
    //    remove an array of images:
    this.removeItems = function(arr) {
        var i = arr.length;
        while (i) {
            if (arr[--i]<this.medianbin) {this.medianindex++;}
            this.histogram[arr[i]]--;
        }
    };
    
    //    set median to position k * (number of entries)
    //    e.g. Median if k=0.5
    this.initMedian = function (k) {
        this.medianbin = 0;
        this.medianindex = k>>0;
        return this.getMedian();
    };
    
    
    this.getMedian = function () {
        //    if needed, update index/bin to current median position:
        while (this.medianindex> this.histogram[this.medianbin]) {
            this.medianindex -= this.histogram[this.medianbin++];
        }
        while (this.medianindex<1) {
            this.medianindex += this.histogram[--this.medianbin];
        }
        
        //    return the value ...
        //    as an average of bin entries:
        return this.colors[this.medianbin];
    };
    
    
    this.setMedian = function (data, i) {
        //    if needed, update index/bin to current median position:
        while (this.medianindex> this.histogram[this.medianbin]) {
            this.medianindex -= this.histogram[this.medianbin++];
        }
        while (this.medianindex<1) {
            this.medianindex += this.histogram[--this.medianbin];
        }
        
        //    return the value ...
        //    as an average of bin entries:
        var c=this.colors[this.medianbin];
        data[i]=c[0];
        data[i+1]=c[1];
        data[i+2]=c[2];
    };
    
    this.clear = function() {
        this.init(this.histogram.length);
    };
    
    //    no used:
    this.getEntries = function () {
        var arr=[];
        this.entries = 0;
        for (var i=0; i<this.histogram.length; i++) {
            if (this.histogram[i]>0) {
                this.entries++;
                for (var j=0; j<this.histogram[i]; j++) {
                    arr.push(i);
                }
            }
        }
        this.initMedian();
        return arr;
    };
    
}

module.exports = {
    MedianFilter,
    MedianHistogram,
    MedianHistogramFast
};
