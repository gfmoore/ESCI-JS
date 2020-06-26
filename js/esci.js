/*
Program       esci.js
Author        Gordon Moore
Date          15 May 2020
Description   The JavaScript code for ESCI
Licence       GNU General Public LIcence Version 3, 29 June 2007

Version history
*/


//#region version history
/*
0.1.0                 Initial version

0.2.0                 Refactored totally and uses D3.js rather than svgjs. Some jquery used to access the dom in dropping means.
Start using version history now to record changes and fixes
0.2.1     2020-05-18  Sort out sharp point on heap curve - fixed with curve interpolation .curveCardinal - others are available 
0.2.2     2020-05-18  Refix capture colouring and Capture % - couldn't fix how to color the sample red inside - yet
0.2.3     2020-05-18  Put samples taken figure next to captured as well. Also show display correctly.
0.2.4     2020-05-18  Fixed issue with captured% not displaying correctly NaN and no %sign.
0.2.5     2020-05-18  Now fixed issue with filling red or gree by adding a pmissed and smissed attribute to the smean svg circle
                        Also reduced the number of bubbles in the population and made same size as samples
0.2.6     2020-05-18  Fixed memory leak with heap being created all the time, and not calc curve, se lines unless checked
0.2.7     2020-05-19  Fix change in CI% not working on previous samples, recalc percentage captured -can only work on what is visible
0.2.8     2020-05-20  Remove sd lines in the drop area, add new checkboxes for the mean and capture of mu
0.2.9     2020-05-20  Add plus minus population moe line. Toggle a  version dialog box if logo clicked.
0.2.10    2020-05-20  Just made the display a bit smaller, especially the bottom of the dropping means window and allow vertical resize
0.2.11    2020-05-22  It was quite a job. Also needed to change plus minus moe if sample size changes. Refactored the display code, it was a mess. Sortd out capture rates again
0.2.12    2020-05-23  Add rectangle and skew distribution. Also just shifted the tick mark at 100 on the axes slightly left to make it visible

0.3.0
0.3.1     2020-05-29  Resize the display area, change some text sizes and change character names. Try to improve
                      responsiveness od display size, made means smaller and reduced gap.
0.3.2     2020-05-30  Add more samples to fill the curve, adjust the heap display
0.3.3     2020-06-06  Made changes to vertical placement of panels, changed css so that panels aren't
                      controlled by grid and rems (which didn't work). Added a font variable to css
                      Made changes to dropping means and show means buttons so that they "switch properly"
                      Re-factored the display of axes as a function - can now display of no pdf
                      Raised bottom axis, extended mu line and added mu text below axis
0.3.4     2020-06-08  Added SE lines according to population sigma, no heap se. Changes to wording on UI to match original ESCI
0.3.5     2020-06-16  Added extra values for N in dropdown, removed unprogrammed option for any CI% in UI, but added dditional CIs to dropdown
0.3.6     2020-06-17  Issue #3 para 3 Changed the version number div to appear on mouseover.             
0.3.7     2020-06-18  Reinstituted on('click', ) so tablets can dismiss the version number
0.3.8     2020-06-18  Sort out issues of means being too extreme <0 >99 and causing indexing issue. Temporary fix.
0.3.9     2020-06-20  Extreme means now do not join heap, but values do get added to stats
                      Looked at what is stored for a sample mean in relation to ssd. Currently NaN, but changed to 0, not sure if makes a difference, but at least consistent.
0.3.10    2020-06-20  Started preliminary work on tooltips


0.3.11    2020-06-21  Try to sort out skew distribution and touch/mouse to draw. Added a tooltips on off button
                      Can draw, adjust and fill, but haven't got a random sample yet from skew or custom, nor do stats
                      Also changed the auto scale. This means manually scaling the pdf[] values - probably better anyway.
0.3.12    2020-06-22  When popuation curve checked off unset fill random as well
0.3.13    2020-06-22  Not allow custom draw when population unchecked
0.3.14    2020-06-24  Redo and Improve filling the population bubbles. Populationbubbles now used to determine random sampling.
                      Also allow dropping means - todo calculate statistics properly.
0.3.15    2020-06-24  Turned off hover on logo for version number - not working properly
                      Going to try lognormal
0.3.16    2020-06-24  Sort our remembering mu sigma,  adjusted axis and mu line font sizes. 
                      Introduced sampling for custom, something not right about capture rate - Calculated the mean and sd from the popnbubbles array, not the pdf (innacurate). Remember old mean and sigma values when switching distribution
                      Need to clear the heap and graph when changing sigma known/unknown. Reset mean heap when heap checked off.
0.3.17    2020-06-25  lognormal skew (including negative skew) - Can't change mean or sd. Note variable in mean and sd as calculated from bubble array and so random.
0.3.18    2020-06-25  Fixed height plus minus moe line re-instated                      

*/
//#endregion

/*
0.3.19    2020-06-25  Sort out heap curve and check when visible or not.
0.3.20
*/

'use strict';
//$(window).load(function () { //doesn't work anyway need to wait for everything to load, not just jquery, though I didn't experience any problems?
$(function() {
  console.log('jQuery here!');  //just to make sure everything is working

  let version = '0.3.19';

  //dialog box to display version
  $('#dialogversion').hide();
  $('#dialogversion').html(`Version : ${version}`);
  
  //need to relook at this
  // $('#logoimg').on('mouseenter', function() {
  //   $('#dialogversion').show(500);
  // })

  // $('#dialogversion').on('mouseleave click touch', function() {
  //   event.stopPropagation();
  //   event.preventDefault();
  //   $('#dialogversion').hide(500);
  // })

  $('#logoimg').on('click', function() {
    $('#dialogversion').show(500);
  })

  $('#dialogversion').on('click', function() {
    event.stopPropagation();
    event.preventDefault();
    $('#dialogversion').hide(500);
  })



  //#region for variable definitions (just allows code folding)
  let $muslider;                //muslider
  let $mu;                      //population mean textbox
  let mu;                       //population mean
  let $sigmaslider;             //sigmaslider
  let $sigma;                   //population standard deviation textbox
  let sigma;                    //population standard deviation
  let sepopn;                   //standard error using the population sigma

  let $normal;                  //normal ditribution selected or not
  let normal;
  let $rectangular;             //rectangular ditribution selected or not
  let rectangular;
  let $skew;                    //skew ditribution selected or not
  let skew;
  let $skewAmount;              //amount of skew dropdown list
  let skewAmount;               //amount of skew -1.0 to 1.0 in steps
  let $custom;                  //custom distribution selected or not
  let custom;             

  let $showPopulationCurve;     //Show population curve true or false
  let showPopulationCurve;

  let $showSDLines;             //Show the population sd lines (inc mean line)
  let showSDLines;
  
  let $fillPopulation;          //fill the population distribution with random sample - little bubbles
  let fillPopulation;
  let popnBubbles = [];         //Array for holding population bubbles
  let yb;                       //scale factor for bubbles;
  
  let $clear;                   //the clear button
  let $takeSample;              //take one sample
  let $runFreely;               //toggle for run freely
  let runFreely = false;        //runfreely flag
  let $speed;                   //speed slider mS
  let speed;
  let triggerTakeSample;        //for use in the start stop timer

  let $n;                       //sample size select element
  let n;                        //sample size
  let $N;                       //Number of samples taken span
  let $N2;                      //redisplay N at capture section
  let N = 0                     //Number of samples taken

  let $xbar;                    //Sample mean text span
  let xbar;                     //sample mean;
  let $ssd;                     //sample standard deviation span
  let ssd;                      //sample standard deviation (/(n-1))


  let $ci;                      //the Confidence Interval dropdown
  let alpha;                    //the significance level;  
  let pci = [];                 //the population confidence interval
  let sci = [];                 //the sample ci
  
  let $pmoe;                    //population margin of error span
  let pmoe;                     //population margin of error 
  let $smoe;                    //sample margin of error span
  let smoe;                     //sample margin of error

  let $showSamplePoints;        //show the sample item points - better word for this?
  let showSamplePoints          
  let $showSampleMeans;         //show the sample means
  let showSampleMeans;
  let $dropSampleMeans;         //show the means dropping down - the dance of the samplemeans
  let dropSampleMeans;

  let $showMoe;                 //checkbox for showing margin of error lines
  let showMoe;                  //variable for showing mrgin of error lines

  let $showPmoe;                //show the population margin of error
  let showPmoe;
  let $showSmoe;                //show the sample margin of error
  let showSmoe;

  let sampleMeanSize = 4; //5;       //the size of the sample mean blob
  let droppingMeanGap = 14; //18;     //gap between dropping means

  let missedTheMean;            //did the confidence interval capture the mean or miss it?

  let $showMeanHeap;            //show the mean heap
  let showMeanHeap;
  let $showSELines;             //show Standard Error lines
  let showSELines;
  let $showMeanHeapCurve;       //show the mean heap curve
  let showMeanHeapCurve;

  let heap = [];                //a frequency array of heap xbars (sample means)

  let $heapxbar;                //the mean of the heap span
  let heapxbar;                 //the mean of the heap
  let $heapse = 0;              //the standard error of the heap span
  let heapse = 0;               //the standard error of the heap
  let heapN = 0;                //count of items in heap;
  let $noInHeap;                //display the no of items in the heap.
  let heapMax = 0;              //calculate the height of the histogram of the sample mean curve for scaling purposes
  let heapCMax;                 //calculate max of hep curve (pdf)
  let xint;                     //integer version of heap xbar
  let heappdf = [];             //heap curve co-ordinates
  let m;                        //used to abbreviate heap count - 1
  let lineh;                    //line generator for heap curve

  let $captured;                //display the number captured
  let $capturedpercent = 0.0;   //display the % captured
  let capturedP = 0             //The number captured for the population moe
  let capturedS = 0;            //The number captured for the sample moe


  let xmax;                     //actual width of viewing window - caters for all viewing sections
  let ymaxP;                    //actual height of viewing window for displayPDF
  let ymaxS;                    //actual height of viewing window for displaysample incl. heap


  let margin;                   //margins for viewport
  let width = 0;                //width of viewport after margins applied
  //let oldwidth = 0;             //width before resize;
  let heightP;                  //height of displayPDF viewport after margins applied
  let heightS;                  //height of displaysample viewport after margins applied

  let x;                        //function to scale x
  let yp;                       //function to scale y displaypdf
  let ys;                       //function to scale y displaysample

  let svgP;                     //the d3 reference to the DOM; where the svg drawing is done for the pdf section
  let svgS;                     //the d3 reference to displaysample

  let pdf = []                  //array that holds the data for the pdf
  let oldpdf = [];

  let line                      //the actual line generated for the pdf

  let samples = [];             //the array of samples
  let id = 0;                   //use as an id for all the samplemeans and elements I create

  let ypos;                     //temp variable for y position of a sample mean
  
  let meanid;                   //used to remove moe wings when at bottom

  
  let $showCaptureMuLine;       //Checkbox for showing the mu line in the dropping mean area
  let showCaptureMuLine;        //variable for mu line on or off

  let $captureOfMu;             //checkbox for capture of mu visible (i.e. mean is red)
  let captureOfMu;              //variable for showing mean is red;

  let $plusminusmoe;            //markers for population moe around mean (on sample drop dpwn area)
  let plusminusmoe;             //variable for $plusminusmoe

  let capturedArray = [];       //record all items as captured or not [{captured: true, xbar: xbar, sse: sse, pmoe: pmoe, smoe: smoe, alpha: alpha}]

  let dropLimit = 40;            //where the bottom axis is and fro detrmining when to "disappear" a dropping mean


  let mblob;                    //used for representing the smean svg blob in display
  let pwing;                    //used for representing the pmoe wings in display
  let swing;                    //used for representing the smoe wings in display
  let blobId;                   //used to get the id of a svg mean blob

  let bubbleX;
  let bubbleY;

  let $captureNextMean;         //The number capturing the next mean
  let captureNextMean;          //

  let xAxis;
  let xAxisB;

  let heapIndex;                //an index into the heap frequency table
  let heapIndexFreq;            //the frequency of the heap at the index

  let letDrop;                  //to control whether the samplemean can drop or be removed (and added to the heap)
  let hght = 0;                 //height of plus minus moe bars

  let tooltipText;              //text for the tooltip
  let $tooltipsonoff;           //tooltips on off button
  let tooltipsonoff = false;    //flag for tool tips

  let position;                 //hold the position of the cursor

  let custompdf = [];           //hold the values of the custom curve

  let normalmu, normalsigma;    //hold original mu sigma as other distriubtions may change them
  let rectmu, rectsigma;
  let skewmu, skewsigma;
  let custommu, customsigma;

  let changedDistribution = false; //to indicate if there was a change in distribution

  let xbardata = [];            //temp record of xbars for the heap to check of continuous calculations actually working

  //#endregion

  
  initialise();

  //#region TESTING Set some checkboxes for when testing.
    $showPopulationCurve.prop('checked', true);
    showPopulationCurve = $showPopulationCurve.is(':checked');
    if (showPopulationCurve) drawPopulationCurve(); else removePopulationCurve();

    $showSamplePoints.prop('checked', true);
    showSamplePoints = true;

    $showSampleMeans.prop('checked', true);
    showSampleMeans = true;
    
    $dropSampleMeans.prop('checked', true);
    dropSampleMeans = true;
    
    $showMeanHeap.prop('checked', true);
    showMeanHeap = true;

    //$fillPopulation.prop('checked', true);    
    //fillPopulation = true;
    //if (fillPopulation) fillPopnBubbles();

    //$showSDLines.prop('checked', true);
    //showSDlines = true;
  //#endregion

  function initialise() {

    $('#mainheading').text('ESCI-JS'); //was D3
    getInterfaceElements()     //get the jquery references to items on the user interface
    getInterfaceValues();      //get current values of all checkboxes, radio-buttons and text-boxes etc.

    setDisplay();              //set up initial display and items and respond to screen resizes

    //just set showPmoe and showSmoe to false initially, even though Pmoe checked. Why? There was a reason!
    showPmoe = true;
    showSmoe = false;

    $('#numbercapturingnextmean').hide();
    $('#percentcapturingnextmean').hide();
    $('#nocapturingnextmean').hide();
    $('#pccapturingnextmean').hide();

    //set the old values of mu sigma for use when changing from one distribution to another.These will reset the mu sigma to what they were before a switch
    normalmu    = mu;
    rectmu      = mu;
    skewmu      = mu;
    custommu   = mu;

    normalsigma = sigma;
    rectsigma   = sigma;
    skewsigma   = sigma;
    customsigma = sigma;

  }

  function setDisplay() {//what to do if browser resize occurs or on start

    //responsive height
    let displaysectionht = $(window).height() -0;  //causes issues was 50
    let controlht = $('#control').height();
    if ( displaysectionht > controlht ) $('#displaysection').height(controlht);
    else $('#displaysection').height( displaysectionht -10);  


    // set the dimensions and margins of the pdf graph area
    //xmax  = $('#displaypdf').width();       //width of viewing window for displayPDF and displaysample
    //try this work around. It looks like $().width is not working properly on narrowing the browser, async problem?
    //oldwidth = width;
    xmax = window.innerWidth - $('#control').width() - 28;

    let sectionwidth = $('#displaysection').css('max-width');
    sectionwidth = sectionwidth.substring( 0, sectionwidth.indexOf( "px" ) );
    sectionwidth = parseInt(sectionwidth);

    if (xmax > sectionwidth) xmax = sectionwidth;
    ymaxP = $('#displaypdf').height(); //-50;      //height of viewing window

    ymaxS = $('#displaysection').height() - ymaxP;

    //what margin do we want - not used,but the "standard" way of doing things 
    margin = {top: 0, right: 0, bottom: 0, left: 0};  //pixels
    width = xmax - margin.left - margin.right;
    heightP = ymaxP - margin.top - margin.bottom;
    heightS = ymaxS - margin.top - margin.bottom;


    //set the oldwidth to be the width when first loaded, after wards it remebers width after a resize
    // if (doOnce) {
    //   oldwidth = width;
    //   doOnce = false;
    // }

    //set a reference to the displaypdf area
    d3.selectAll('svg > *').remove();  //remove all elements under svgP
    $('svg').remove();                 //remove the all svg elements from the DOM

    svgP = d3.select('#displaypdf')     //ref to displayPDF
            .append('svg')
            .attr('width', width).attr('height', heightP);    

    //set a reference to the displaysample area
    svgS = d3.select('#displaysample')  //ref to displaySample
            .append('svg')
            .attr('width', width).attr('height', heightS);  

    //set up scales for displaypdf and displaysample
    x  = d3.scaleLinear().domain([ 0, 100 ]).range([5, width]);  //common to both viewports
    yp = d3.scaleLinear().domain([ 0, d3.max(pdf, function(d) { return d.y}) ]).range([heightP, 10]);
    ys = d3.scaleLinear().domain([ 0, 500 ]).range([0, heightS]);  //go from y = 500 at bottom to 0 at top, beacuse samplemeans increase as they drop!

    //check the draw population radiobutton
    if (showPopulationCurve) drawPopulationCurve(); else removePopulationCurve();
    if (fillPopulation) fillPopnBubbles();
 
    drawAxes();
    clearAll();

  }

  function drawAxes() {
    //setup axes at top and bottom
    xAxis = d3.axisTop(x);	
    xAxisB = d3.axisBottom(x);

    //display axes
    //top
    svgP.append('g').attr('class', 'axis x').attr( 'transform', 'translate(0, 20)' ).call(xAxis);

    //bottom
    svgS.append('g').attr('class', 'axis x').attr( 'transform', `translate(0, ${heightS - dropLimit} )` ).call(xAxisB);
    
    //just draw a vertical line    //svgP.append('g').attr('class', 'axis y').attr('transform', 'translate(10,20)').call(yAxis);
    svgP.append('line').attr('class', 'axisline').attr('x1', 5).attr('y1', 25).attr('x2', 5).attr('y2', heightP );

    //draw a horizontal line under the curve on the sample display section
    svgS.append('line').attr('class', 'horizline').attr('x1', 5).attr('y1', ys(0)).attr('x2', xmax-5).attr('y2', ys(0)). attr('stroke', 'gray').attr('stroke-width', '2');

    //adjust the 100 tick text 2px left. jQuery cannot access the svg contents. SVG DOM is different to HTML DOM Use set/getAttributeNS
    document.getElementsByClassName("tick")[10].children[0].setAttributeNS(null, 'transform', `translate(${-2},0)`);
    document.getElementsByClassName("tick")[21].children[0].setAttributeNS(null, 'transform', `translate(${-2},0)`);
    //move the text 5 pixels left
    document.getElementsByClassName("tick")[10].children[1].setAttributeNS(null, 'transform', `translate(${-12},0)`);
    document.getElementsByClassName("tick")[21].children[1].setAttributeNS(null, 'transform', `translate(${-12},0)`);
  }

  //clear button
  $clear.on('click', function() {
    clearAll();
  })

  //clear everything.
  function clearAll() {
    resetSampleStats();

    //remove sample points from DOM
    d3.selectAll('.samplepoint').remove();

    //remove sample means and moes
    d3.selectAll('.smean').remove();
    d3.selectAll('.pmoe').remove();
    d3.selectAll('.smoe').remove();

    resetHeap();
    xbardata = [];

    resetCaptureStats();

    id = 0;  //the id of the mean and moes for the svg element
    N = 0;   //clear the number of samples taken

    capturedArray = [];            //clear the capture array - used for calculating capture %

    $('#numbercapturingnextmean').hide();
    $('#percentcapturingnextmean').hide();
    $('#nocapturingnextmean').hide();
    $('#pccapturingnextmean').hide();

    //plusminusmoe lines off
    //$plusminusmoe.prop('checked', false);   //?why do I want to remove plus minus moe lines on clear?
    //plusminusmoe = false;
    //d3.selectAll('.plusminusmoe').remove();  

    hght = 0;  //reset the height of the grwoing SE Lines (and if used the growing plus minus moe lines)

    //pdf = [];
  }
  

  /*---------------------------------------------Draw Population---------------------------------------*/
  //draw the population curve
  function drawPopulationCurve() {

    d3.selectAll('.pdf').remove();
    removePopnBubbles();
    
    if (showPopulationCurve) {
      if (normal)       drawNormalCurve();
      if (rectangular)  drawRectangularCurve();
      if (skew)         drawSkewCurve();
      if (custom)       drawCustomCurve();
    }

    //now re-draw the mean and sd lines
    if (showSDLines) drawSDLines();

    if (showCaptureMuLine) drawMuLine();
  }

  //remove the population curve
  function removePopulationCurve() {
    //removing population curve and remove sd lines as well and turn off the sd line checkboxove
    removePDF();
    removeSDLines();
    $showSDLines.prop('checked', false);
  }

  //create my probability density function pdf
  //how many points for the curve? As this will be used in creating bubbles and random samples except for normal where we have functions 
  function drawNormalCurve() {
    pdf = [];

    //reinstate original mu sigma only if coming from another distribution
    if (changedDistribution) {
      setMuSigmaSliderVal(normalmu, normalsigma);
      mu = normalmu;
      sigma = normalsigma;
    }

    //for (let x = mu-5*sigma; x < mu+5*sigma; x += 0.1) {
   for (let x = 0; x < 100; x += 0.1) {
      pdf.push({ x: x, y: jStat.normal.pdf(x, mu, sigma) })
    }

    let mn = d3.max(pdf, function(d) { return  d.y } );

    //scale it to fit in with drawing area
    pdf.forEach(function(v) {
      v.y = v.y  * (sigma * 160 + 2000); //linear equation            
    })

    drawPDF();
  }

  function drawRectangularCurve() {
    let l, h;
    l = mu-sigma;
    h = mu+sigma;

    pdf = [];

    if (changedDistribution) {
      setMuSigmaSliderVal(rectmu, rectsigma);
      mu = normalmu;
      sigma = normalsigma;
    }

    //actually I only need 6 points in the pdf!! but its so fast...
    pdf.push( {x: 0, y: 0} ); 
    pdf.push( {x: l, y: 0} );
    pdf.push( {x: l, y: 160} );
    pdf.push( {x: h, y: 160} );
    pdf.push( {x: h, y: 0} );
    pdf.push( {x:100, y: 0} );

    drawPDF();
  }

  function drawSkewCurve() {
    pdf = [];
    skewAmount = parseFloat($skewAmount.val());

    if (changedDistribution) {
      setMuSigmaSliderVal(skewmu, skewsigma);
      mu = normalmu;
      sigma = normalsigma;
    }

    //Approximation to Skew Normal due to Samir K. Ashour, Mahmood A. Abdel-hameed https://www.sciencedirect.com/science/article/pii/S209012321000069X 
    // let k = Math.abs(skewAmount) * 20;
    // let rt2pi = Math.sqrt(2*Math.PI);
    // let rt2divpi = Math.sqrt(2/Math.PI);

    // let x, y;
    // for (let xx = -3; xx < 3; xx += 0.01) {
    //   x = xx;
    //   if (x < -3/k) {
    //     y = 0;
    //     //pdf.push({ x: x, y: 0 })
    //   }
    //   if (x >= -3/k && x < -1/k) {
    //     y = 1/(8 *rt2pi) * Math.exp(-(x*x)/2) * (9*k*x + 3*k*k*x*x + k*k*k*x*x*x/3 + 9);
    //   }
    //   if (x >= -1/k && x < 1/k ) {
    //     y =  1/(4 *rt2pi) * Math.exp(-(x*x)/2) * (3*k*x - k*k*k*x*x*x/3 + 4);
    //   }
    //   if (x >= 1/k && x < 3/k) {
    //     y = 1/(8 *rt2pi) * Math.exp(-(x*x)/2) * (9*k*x - 3*k*k*x*x + k*k*k*x*x*x/3 + 7);
    //   }
    //   if (x >= 3/k) {
    //     y = rt2divpi *Math.exp(-(x*x/2));
    //   }
    //   if (y > 0) pdf.push( {x: x, y: y} ); //is this condition correct?
    // }

    //scale the pdf
    // pdf.forEach( v => {
    //   v.x = v.x*sigma + mu;
    //   v.y = v.y * 300; //??
    // })

    //lognormal version
    let k = Math.abs(skewAmount);
    for (let x = -0.5; x < 5; x += 0.01) {
      pdf.push( {x: x, y: jStat.lognormal.pdf(x, 0, k) } );
    }

    //scale it up
    pdf.forEach( v => {
      if (k === 0.1) {
        v.x = v.x*198.0 - 149;
        v.y = v.y * 26;
      }
      if (k === 0.2) {
        v.x = v.x*100.0 - 52;
        v.y = v.y * 60;
      }
      if (k === 0.3) {
        v.x = v.x*60.0 - 13.0;
        v.y = v.y * 100;
      }
      if (k === 0.4) {
        v.x = v.x*45.0 + 1.0;
        v.y = v.y * 140;
      }
      if (k === 0.5) {
        v.x = v.x*34.0 + 12.0;
        v.y = v.y * 180;
      }
      if (k === 0.6) {
        v.x = v.x*28.0 + 17.0;
        v.y = v.y * 220;
      }
      if (k === 0.7) {
        v.x = v.x*24.0 + 21.0;
        v.y = v.y * 245;
      }
      if (k === 0.8) {
        v.x = v.x*22.0 + 23.0;
        v.y = v.y * 270;
      }
      if (k === 0.9) {
        v.x = v.x*20.0 + 25.0;
        v.y = v.y * 290;
      }
      if (k === 1.0) {
        v.x = v.x*18.0 +27.0;
        v.y = v.y * 300;
      }

      //get the negative version, of course this reverses the array so largest x values at start, need to put back in order otherwise bubble won't work
      if (skewAmount < 0) {
        v.x = 100 - v.x;
      }
    })

    let temp = [];
    //think I'll remove any negative x values
    for (let i = pdf.length - 1; i >= 0; i--) {
      if (pdf[i].x < 2) {   //anything else is too small! If I use 0 it appears on the display
        pdf.splice(i, 1);
      }
      else {
        if (skewAmount < 0) {  //reverse the array if negative skew
          temp.push(pdf[i]);
        } 
      }
    }    

    if (skewAmount < 0) pdf = temp; //I think you can do this?

    //need a random array of bubbles for calculating means and sds
    fillPopnBubbles(); 

    let s = 0, n = 0, s2 = 0;
    popnBubbles.forEach( v => {
      s += v.x;
      s2 += v.x * v.x;
      n += 1;
    })

    mu = s/n;
    sigma = Math.sqrt(s2/n - mu*mu);
    setMuSigmaSliderVal(mu, sigma);


    drawPDF();
  }


  function drawCustomCurve() {
    //#region draw the custom curve
    if (changedDistribution) {
      setMuSigmaSliderVal(custommu, customsigma);
      mu = normalmu;
      sigma = normalsigma;
    }

    //is there still a custompdf
    if (custompdf.length !== 0) {
      pdf = [];
      oldpdf.forEach( function(v) {
        pdf.push({ x: v.x, y: v.y }); 
      })
      
    }
    else {
      pdf = [];
    }

    //I calculate the mu and sigma here from the weighted mean of the pdf? No too inaccurate.  
    //Use the populatioBubbles array, but possibly also errors (the range of values?)

    let s = 0, n = 0, s2 = 0;
    // pdf.forEach(v => { 
    //   s += v.x * v.y;
    //   s2 += (v.x * v.x) * v.y;
    //   n += v.y;
    // })

    popnBubbles.forEach( v => {
      s += v.x;
      s2 += v.x * v.x;
      n += 1;
    })

    mu = s/n;
    sigma = Math.sqrt(s2/n - mu*mu);
    setMuSigmaSliderVal(mu, sigma);

    drawPDF();
  }
  //if mousedown on displaypdf area and custom selected allow draw
  let oldxm, oldym, xm, ym, mdown = false;
  $('#displaypdf')
    .mousedown(function(e) {
      //probably best to clear everything
      clearAll();
      if (!showPopulationCurve) return;  //can only draw custom curve if popuation checked
      if (!custom) return;               //and when custom selected
      custompdf = [];
      oldpdf = [];
      d3.selectAll('.pdf').remove();
      if (event.which === 1) { //left click
        mdown = true;
        oldxm = e.pageX - $(this).offset().left;
        oldym = e.pageY - $(this).offset().top;

        custompdf.push({ x:oldxm , y: heightP }) //starting point
        custompdf.push( {x: oldxm, y: oldym} ); //get first mouse point

        svgP.append('line').attr('class', 'custompdf')  //draw the first vertical line
        .attr('x1', oldxm).attr('y1', heightS).attr('x2', oldxm).attr('y2', oldym)
        .attr('stroke', 'red').attr('stroke-width', 2);
      }
      if (e.which === 3) { //right click}
        e.preventDefault();
        e.stopPropagation();
        d3.selectAll('.custompdf').remove();
        custompdf = [];
        oldpdf = [];
        removePopnBubbles();
      }
    })
    .mouseup(function() {
      if (!custom) return;
      mdown = false;
      custompdf.push({ x:oldxm , y:heightP }) //ending point
      d3.selectAll('.custompdf').remove();
      //need to scale the custompdf which is in pixels say, 0->width, heightP->0 to the pdf which is say 0->100 and 0->200
      //note might not be that many pixels in custom - will this be a problem?
      //note there are margins to take into account
      custompdf.forEach( function(v) {
        pdf.push({ x: v.x * 100 / width - 0.8, y: heightP - v.y + 5}); 
        oldpdf.push({ x: v.x * 100 / width - 0.8, y: heightP - v.y + 5}); //make a backup for redraw purposes
      })
      
      //to do means and mu sigma etc create the bubbles array, but not display it unless fill population enabled
      fillPopnBubbles();

      drawCustomCurve();  //now draw it and get values from it
    })

  $('#displaypdf').mousemove(function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!custom) return;
    if (custom && mdown) {
      xm = e.pageX - $(this).offset().left;
      if (xm < oldxm) xm = oldxm; //can't go backwards
      ym = e.pageY - $(this).offset().top;
      //draw lines between the points, but not let x go backwards
      svgP.append('line').attr('class', 'custompdf')
        .attr('x1', oldxm).attr('y1', oldym).attr('x2', xm).attr('y2', ym)
        .attr('stroke', 'red').attr('stroke-width', 2);

      if (xm >= oldxm) oldxm = xm;  //can't go backwards
      oldym = ym;
      custompdf.push( {x: oldxm, y: oldym} )
    }
  })

  //stop right click contextmenu firing wehn drawing custom pdf
  $('#displaypdf').bind("contextmenu",function(e){
    return false;
  });
  //#endregion


  function setMuSigmaSliderVal(mu, sigma) {
    $mu.val(mu.toFixed(2));
    $muslider.val(mu.toFixed(2));

    $sigma.val(sigma.toFixed(2));
    $sigmaslider.val(sigma.toFixed(2));

    changedDistribution = false; 
  }

  function drawPDF() {
    //changed to so that pdf is prescaled and shows the correct changes with change of sd
    //yp = d3.scaleLinear().domain([ 0, d3.max(pdf, function(d) { return d.y}) + 0.005 ]).range([heightP, 10]);
    yp = d3.scaleLinear().domain([ 0, heightP ]).range([heightP, 10]);

    //create a generator
    line = d3.line()
    .x(function(d, i) { return x(d.x); })
    .y(function(d, i) { return yp(d.y); });

    //display the curve
    svgP.append('path')
      .attr('class', 'pdf')
      .attr('d', line(pdf))

    //draw popn bubbles if fill selected
    if (fillPopulation) fillPopnBubbles();

    //just a big fix for when switching distributions especially on custom
    if (showCaptureMuLine) drawMuLine(); else removeMuLine();
  }

  function removePDF() {
    d3.selectAll('.pdf').remove();
  }

  //draw the mean and sd lines
  function drawSDLines() {
    //remove sd lines first then redraw
    removeSDLines();

    //line styles in css eg style('stroke', 'gray').style('stroke-width', 2)
    svgP.append('line').attr('class', 'meanlines').attr('x1', x(mu)).attr('y1', 25).attr('x2', x(mu)).attr('y2', heightP -5);

    //sd lines
    svgP.append('line').attr('class', 'sdlines').attr('x1', x(mu-3*sigma)).attr('y1', 25).attr('x2', x(mu-3*sigma)).attr('y2', heightP -5);
    svgP.append('line').attr('class', 'sdlines').attr('x1', x(mu-2*sigma)).attr('y1', 25).attr('x2', x(mu-2*sigma)).attr('y2', heightP -5);
    svgP.append('line').attr('class', 'sdlines').attr('x1', x(mu-sigma)).attr('y1', 25).attr('x2', x(mu-sigma)).attr('y2', heightP -5);
    svgP.append('line').attr('class', 'sdlines').attr('x1', x(mu+sigma)).attr('y1', 25).attr('x2', x(mu+sigma)).attr('y2', heightP -5);
    svgP.append('line').attr('class', 'sdlines').attr('x1', x(mu+2*sigma)).attr('y1', 25).attr('x2', x(mu+2*sigma)).attr('y2', heightP -5);
    svgP.append('line').attr('class', 'sdlines').attr('x1', x(mu+3*sigma)).attr('y1', 25).attr('x2', x(mu+3*sigma)).attr('y2', heightP -5);
  }

  //remove the mean and sd lines
  function removeSDLines() {
    d3.selectAll('.meanlines').remove();
    d3.selectAll('.sdlines').remove();
  }

  function drawMuLine() {
    removeMuLine(); //remove any previous one
    svgS.append('line').attr('class', 'muline').attr('x1', x(mu)).attr('y1', 25).attr('x2', x(mu)).attr('y2', heightS-dropLimit);  
    svgS.append('text').text('\u00B5').attr('class', 'mutext').attr('x', x(mu)-4).attr('y', heightS-10);
  }

  function removeMuLine() {
    d3.selectAll('.muline').remove();
    d3.selectAll('.mutext').remove();
  }

 
  function fillPopnBubbles() {
    //fill the distribution curve with sample bubbles
    //create a random array of points where bubbles will go for each pdf. 
    //These will be used to get random points for samples
    // do a loop, for each loop select a randomx (between -inf and +inf!!!), at randomx look for the two x values in the pdf closest that bound the randomx. 
    //Work out average height, then create a random point between the bottom and this value. Add to randompdf array.
  
    let ah;   

    let minxpdf, maxxpdf;
    let r = sampleMeanSize;
    let minx, maxx, miny, maxy;

    let drawit; //shall I draw it?
      
    popnBubbles = [];

    fillPopulation = $fillPopulation.is(':checked');
//    if (fillPopulation) {

      minxpdf = d3.min(pdf, function(d) { return d.x });
      maxxpdf = d3.max(pdf, function(d) { return d.x });

      //create array of bubbles, not all may be drawn, but array will be used for random sampling (except for normal)
      for (let b = 0; b < width * 50; b += 1) {   //this many bubbles, depends on display width width * 1

        //now need to get a random x between min and max x of pdf
        bubbleX = randbetween(minxpdf, maxxpdf);

        //scan through pdf looking for nearest x coordinate  
        ah = 0;
        for (let v = 0; v < pdf.length; v += 1) {  
          if (pdf[v].x > bubbleX) { //found one
            if (v !== 0) { 
              //linear interpolation
              minx = pdf[v-1].x;
              maxx = pdf[v].x;
              miny = pdf[v-1].y;
              maxy = pdf[v].y;
              ah = miny + (bubbleX - minx)/(maxx-minx) * (maxy - miny); //linear interpolation between two ordinates - best I can do?, splines least squares?
              break;
            }
          }
        }  //end of scan

        //pick a random n bewtween 0 and the max height. If it is < ah then we have a bubble - its a probability! If the curve is close to the bottom there is less probability of filling it with a bubble, if it is higher then more probability!
        bubbleY = randbetween(0, heightP);
        if (bubbleY < ah) {
          popnBubbles.push({ x: bubbleX, y: bubbleY });

          //work out some limits as to whether to draw a bubble.
          //r may not be the best unit as not to same scale!
          drawit = true;

          //rectangular need to be narrower area for visibility
          //need to get minx and max x

          let w = 4 * 100/width;
          if (normal || skew || custom) {
            if (bubbleY < 10)   drawit = false;
            if (bubbleY > ah - 7)  drawit = false;
            if (bubbleX < minxpdf + w ) drawit = false;
            if (bubbleX > maxxpdf - w ) drawit = false;
          }
          if (rectangular) {
            if (bubbleY < 7)   drawit = false;
            if (bubbleY > 154)   drawit = false;
            if (bubbleX < mu - sigma + w) drawit = false;
            if (bubbleX > mu + sigma - w) drawit = false;
          }

          if (drawit) {
            if (fillPopulation) svgP.append('circle').attr('class', 'popnbubble').attr('cx', x(bubbleX)).attr('cy', yp(bubbleY) ).attr('r', sampleMeanSize);
          }

        }

      }
//    }
  }

  //remove population bubbles
  function removePopnBubbles() {
    d3.selectAll('.popnbubble').remove();
  }
  
  //random float between a, b
  function randbetween(a, b) {
    if (b < a) return a;
    return (Math.random() * (b - a) + a);
  }


  //------------------------------------------------Get Samples--------------------------------------*/

  //take a sample from the population
  function takeSample() {
    //note xbar is calculated in sampleStatistics and used for the sample mean and it's blob
    //need to use these for when I loop through each dropping mean blob
    let ixbar;  //integer version of xbar from dropping blob
    let fxbar;  //floating point version of xbar from dropping blob
    let barHeight;

    N += 1; //increase the number of times I take a sample

    //make sure I've got correct parameters from distribution
    mu = parseInt($mu.val());
    sigma = parseInt($sigma.val());

    //set the sample array to empty 
    samples = [];
    //get the number of samples to draw
    n = parseInt($('#samplesselected option:selected').val());

    if (normal) {
      //draw n samples
      for (let i = 0; i < n; i += 1) {
        //jStat.normal.sample( mu, sigma )
        samples.push( jStat.normal.sample(mu, sigma) );
      }
    }

    if (rectangular) {
      for (let i = 0; i < n; i += 1) {  //-1, + 1 just to get appearance right!
        samples.push( randbetween(mu-sigma, mu+sigma) );
      }      
    }

    if (skew) {
      for (let i = 0; i < n; i += 1) {
        //go through popnbubbles and pick a random sample. popnBubbles is a random array of datapoints for the distribution
        let r = parseInt(randbetween(0, popnBubbles.length - 1));
        samples.push(popnBubbles[r].x); 
      }

    }

    if (custom) {
      for (let i = 0; i < n; i += 1) {
        //go through popnbubbles and pick a random sample
        let r = parseInt(randbetween(0, popnBubbles.length - 1));
        samples.push(popnBubbles[r].x);  
      }
    }

    //calculate the statistics e.g. sample mean, sample sd, popn moe, sample moe
    sampleStatistics();

    //display the sample points. (remove any that exist then create anew)
    d3.selectAll('.samplepoint').remove();
    samples.forEach(sampleItem => {
      svgS.append('circle').attr('class', 'samplepoint').attr('cx', x(sampleItem)).attr('cy', '10').attr('r', sampleMeanSize);
    })

    //show the sample points
    if (showSamplePoints) {
      d3.selectAll('.samplepoint').attr('visibility', 'visible');
    }
    else {
      d3.selectAll('.samplepoint').attr('visibility', 'hidden');
    }

    //Now at this point I have to get the means to DANCE!!!. If droppingMeans true  - shift down the older samplemeans.
    if (dropSampleMeans) {
      //should change this to an D3 function now, but can't get it to work on individual items???
      //e.g. d3.selectAll('.smean').each(function(d, i) {    d3.select(this).attr('cy')  }) does all of them at once 

      $('.smean').each(function() { //get an array of all smean svg elements - circles
        
        meanid = $(this).attr('id').substring(5); 
        for (let i = 0; i < droppingMeanGap; i += 1) {  //for each sample mean that is dropping
          //tempted to put in a small delay here since can't see the sample mean hit the bottom axis as it's too fast

          ypos = parseInt($(this).attr('cy')) + 1; //move it 1 pixel at a time

          letDrop = false;
          if (showMeanHeap) {  //if the mean heap is visible look at the sample mean. Compare it with the height of the heap  frequency at that point

            //get the sample mean from the dropping blob
            ixbar = parseInt($(this).attr('xbar'));
            fxbar = parseFloat($(this).attr('xbar'));

            //if xbar outside viewable area 0-100 then cannot add to heap display
            if ((ixbar < 0 || ixbar >= 100)) {
              //well even though we cannot see it, need to keep it dropping, so treat it as though no heap visible
              if (ypos <= heightS - dropLimit - sampleMeanSize) {
                letDrop = true;
              }
              else {
                letDrop = false;
              }              
            }
            else {
              //the sample mean is inside the viewable area so check against the heap height
              heapIndex = parseInt(ixbar/100 * heap.length);
              heapIndexFreq = heap[heapIndex].f;

              //this should be the height or position of top of bar at heapIndex
              barHeight = heightS - dropLimit - (heapIndexFreq * 2 * sampleMeanSize);

              //if height of samplemean is less than height of bar at that position let it drop otherwise disappear it
              if (ypos < barHeight ) {
                letDrop = true;
              }
              else {
                letDrop = false;
              }
            }
          }
          else {  //else no heap showing
            if (ypos <= heightS - dropLimit - sampleMeanSize) {
              letDrop = true;
            }
            else {
              letDrop = false;
            }            
          }

          //allow to hit the axis or top of heap before disappearing
          if (letDrop) {
            $(this).attr('cy', ypos);  //move it and moe wings down 1 pixel
            d3.select('#pmoe'+meanid).attr('y1', ypos);  
            d3.select('#pmoe'+meanid).attr('y2', ypos); 
            d3.select('#smoe'+meanid).attr('y1', ypos);
            d3.select('#smoe'+meanid).attr('y2', ypos); 
          }
          else {  // gone too far remove it and the moe wings
            $(this).remove();
            d3.select('#pmoe'+meanid).remove();  
            d3.select('#smoe'+meanid).remove();

            if (showMeanHeap) addToHeap(fxbar); 
            break;  //no point in moving anymore
          }

        }
        //break to here
        let a = 2;
      })
    }
    else {
      //just hide or remove dropping means including old ones - I think removing makes more sense
      d3.selectAll('.smean').remove();
      d3.selectAll('.pmoe').remove();
      d3.selectAll('.smoe').remove();
    }
    
    //create the new sample mean and moe wings svg items.
    ypos = 25; //initial position of mean  
    
    //update the capturedArray stats
    capturedArray.push(
      {
        id: id,
        xbar:  xbar,
        ssd:   ssd
      }
    );

    //add the population moe and sample moe wings then mean blob and hide them  x() is the scaling. Also add xbar and s
    svgS.append('line').attr('class', 'pmoe').attr('id', 'pmoe' + id).attr('x1', x(xbar-pmoe)).attr('y1', ypos).attr('x2', x(xbar+pmoe) ).attr('y2', ypos).attr('stroke', 'lawngreen').attr('visibility', 'hidden').attr('xbar', xbar).attr('sigma', sigma);
    svgS.append('line').attr('class', 'smoe').attr('id', 'smoe' + id).attr('x1', x(xbar-smoe)).attr('y1', ypos).attr('x2', x(xbar+smoe) ).attr('y2', ypos).attr('stroke', 'lawngreen').attr('visibility', 'hidden').attr('xbar', xbar).attr('ssd', ssd);;

    //add the blob on top  -- note the attr for xbar, with svg can add any attribute you want as long as it doesn't conflict. The 'missed' attribute will be used to try and fill the inside red when showPmoe showSmoe selected or back to green when mot selected
    svgS.append('circle').attr('class', 'smean').attr('id', 'smean' + id).attr('cx', x(xbar)).attr('cy', ypos).attr('r', sampleMeanSize).attr('fill', 'lawngreen').attr('visibility', 'hidden').attr('xbar', xbar).attr('xbar', xbar).attr('sigma', sigma).attr('ssd', ssd).attr('pmissed', 'false').attr('smissed', 'false');

    //just display the currently created sample appearance
    displaySampleAppearance(id);

    
    //just display new captured stats
    displayCapturedRate();

    //increment the id value
    id += 1;
  }

  //decide what to display for dropping means blob and MoEs
  function displaySampleAppearance(id) {
    if (!showSampleMeans) return;  //if checkbox for show sample means not checked don't display

    mblob = d3.select('#smean'+id);
    pwing = d3.select('#pmoe'+id);
    swing = d3.select('#smoe'+id);

    //work out CIs and whether missed or not
    pci = jStat.normalci( parseFloat(mblob.attr('xbar')), alpha, parseFloat(mblob.attr('sigma')), n );  //n is just the no of items in the sample, if that changes need to start counting again
    sci = jStat.tci( parseFloat(mblob.attr('xbar')), alpha, parseFloat(mblob.attr('ssd')), n);   
    
    //do the pmoe count
    missedTheMean = false;
    if (pci[0] > mu) missedTheMean = true;
    if (pci[1] < mu) missedTheMean = true;
    if (missedTheMean) {
      mblob.attr('pmissed', 'true');  //check whether these are needed with this refactoring, all needs recalcing anyway if CI changes
    }
    else {
      mblob.attr('pmissed', 'false'); 
      capturedP += 1;
    }

    //smoe
    missedTheMean = false;
    if (sci[0] > mu) missedTheMean = true;
    if (sci[1] < mu) missedTheMean = true;
    if (missedTheMean) {
      mblob.attr('smissed', 'true');
    }
    else {
      capturedS += 1;
      mblob.attr('smissed', 'false');
    }

    //now decide what to display; showPmoe and showSoe mutually exclusive
    if (showMoe) {
      if (showPmoe) {
        if ( mblob.attr('pmissed') === 'true') {
          pwing.attr('stroke', 'red');
          mblob.attr('fill', 'red');
        }
        else {
          pwing.attr('stroke', 'lawngreen');
          mblob.attr('fill', 'lawngreen');
        }
        pwing.attr('visibility', 'visible');
        mblob.attr('visibility', 'visible');
      }

      if (showSmoe) {
        if (mblob.attr('smissed') === 'true') {
          swing.attr('stroke', 'red');
          mblob.attr('fill', 'red');
        }
        else {
          swing.attr('stroke', 'lawngreen');
          mblob.attr('fill', 'lawngreen');
        }
        swing.attr('visibility', 'visible');
        mblob.attr('visibility', 'visible');
      }

    }
    else {  //don't show moes
      if (captureOfMu) { 
        if (showPmoe) {
          if (mblob.attr('pmissed') === 'true') {
            mblob.attr('fill', 'red');
          }
          else {
            mblob.attr('fill', 'lawngreen');
          }
        }

        if (showSmoe) {
          if (mblob.attr('smissed') === 'true'){
            mblob.attr('fill', 'red');
          }
          else {
            mblob.attr('fill', 'lawngreen');
          }
        }

      }
      else { //not capture of mu and not show moes
        mblob.attr('fill', 'lawngreen');
        pwing.attr('visibility', 'hidden');
        swing.attr('visibility', 'hidden');
        if (showSampleMeans) mblob.attr('visibility', 'visible');
      }

      mblob.attr('visibility', 'visible');
    }

  }


  function displaySampleAppearanceAll() {
    //hide all wings
    d3.selectAll('.pmoe, .smoe').attr('visibility', 'hidden');

    //get all displayed mean blobs
    d3.selectAll('.smean').each(function() {
      //get the id
      blobId = parseInt($(this).attr('id').substring(5));
      displaySampleAppearance(blobId);
    })
  }

  //calculate statistics in samples[]
  function sampleStatistics() {
    //get stats from jStat
    //this should be okay for all types of distribution
    xbar  = jStat.mean(samples);
    ssd   = jStat.stdev(samples, true);  //true is supposed to give the sample sd

    //the mu and sigma for skew and custom are calculated from the popnbubbles array.

    //for display - calc length of each wing, i.e. the margin of error
    if (isNaN(ssd)) {  //if the ssd cannot be calculated, i.e. sample size N is 1
      ssd = 0;
      pci = jStat.normalci( xbar, alpha, sigma, n ); //e.g. for 95% CI alpha = 0.05
      sci = [0, 0];
      pmoe  = pci[1] - xbar;
      smoe  = 0;
    }
    else {
      pci = jStat.normalci( xbar, alpha, sigma, n ); //e.g. for 95% CI alpha = 0.05
      sci = jStat.tci( xbar, alpha, ssd, n);
      pmoe  = pci[1] - xbar;
      smoe  = sci[1] - xbar;
    }

    //display stats
    $N.text(N);
    $N2.text(N);
    $xbar.text(xbar.toFixed(2));
    $ssd.text(ssd.toFixed(2));
    $pmoe.text(pmoe.toFixed(2));
    $smoe.text(smoe.toFixed(2));
  }

  function resetSampleStats() {
    //reset percentages captures
    N = 0;
    $N.text(0);
    $N2.text(0);

    $xbar.text('0');
    $ssd.text('0');
    $pmoe.text('0');
    $smoe.text('0');
  }

  //display the percentage captured
  function displayCapturedRate() {

    //only do this if CI on  Mu line on  capture of mu on
    if (showMoe || showCaptureMuLine || captureOfMu) {
      //given that N is the number of samples
      $N.text(N);
      $N2.text(N);
      //should be able to use showPmoe only
      if ($showPmoe.is(':checked')) {
        //should recalculate the number of samples taken
        $captured.text(capturedP);
        if (N !== 0) $capturedpercent.text((capturedP/N *100).toFixed(1) + '%');
      }
      if ($showSmoe.is(':checked')) {
        $captured.text(capturedS);
        if (N !== 0) $capturedpercent.text((capturedS/N *100).toFixed(1) + '%');
      }
    }
    else {
      $N2.text(0);
      $captured.text(0);
      $capturedpercent.text(0);
    }
  }

  //reset capture stats
  function resetCaptureStats() {
    N = 0;
    $N.text(0);
    $N2.text(0);

    capturedP = 0;
    capturedS = 0;
    $captured.text('0');
    $capturedpercent.text('0.0%');
  }

  //From change CI % - alpha, ,showPmoe, showSmoe, (showMoe), if change the CI % need to recalculate the same taken and missed to be what's displayed, as previous sample are removed.
  //variables to check change $N - the number of samples taken - should capturedArray.length()
  //
  function recalculateSamplemeanStatistics() {
    //have a capturedArray so recalc the number captured from all samples
    capturedP = 0;
    capturedS = 0;
    capturedArray.forEach(s => {
      pci = jStat.normalci( s.xbar, alpha, sigma, n );  //n is just the no of items in the sample, if that changes need to start counting again
      sci = jStat.tci( s.xbar, alpha, s.ssd, n);      

      //do the pmoe count
      missedTheMean = false;
      if (pci[0] > mu) missedTheMean = true;
      if (pci[1] < mu) missedTheMean = true;
      if (missedTheMean) {

      }
      else {
        capturedP += 1;
      }

      //do the smoe count
      missedTheMean = false;
      if (sci[0] > mu) missedTheMean = true;
      if (sci[1] < mu) missedTheMean = true;
      if (missedTheMean) {

      }
      else {
        capturedS += 1;
      }
      
      displayCapturedRate();
    })
  }


  /*------------------------------------------do the heap------------------------------------------*/
  //when sample mean gets far enough, add to the heap display   -- from takeSample()
  function addToHeap(xbar) {
    let increaseFrequency = true;

    
    //if samplemean is too small or too large don't do anything. 
    if (xbar < 0 || xbar >= 100) {
      //don't do anything to visible part of heap
    }
    else {
      //increase the heap frequency
      xint = parseInt( Math.trunc(xbar/100 * heap.length )); //truncate is just to slightly shift the heap left
      heap[xint].f += 1;

      //now draw a bubble at co-ords xint and heap(xint) with an adjustement  remember x() is our scaling function from D3.dropLimit changes based on vertical height of browser (viewport) - not particularly great.
      svgS.append('circle').attr('class', 'heap').attr('cx', (heap[xint].x * 2* sampleMeanSize) + (sampleMeanSize  + 2) ).attr('cy', heightS - (heap[xint].f * sampleMeanSize * 2) - dropLimit + 3).attr('r', sampleMeanSize).attr('stroke', 'blue').attr('stroke-width', 1).attr('fill', 'lawngreen').attr('visibility', 'hidden');

      if (showMeanHeap) {
        d3.selectAll('.heap').attr('visibility', 'visible');
      }
      else {
        d3.selectAll('.heap').attr('visibility', 'hidden');
      }
    }

    //must calculate heap stats even with non visible mean
    calculateHeapStatistics(xbar);  //this could be a slow downer! //should do it continuously?

    drawSELines() //now fixed to population sd.

    drawMeanHeapCurve() // this will be dynamic as well

    if (plusminusmoe) drawPlusMinusMoe();
  }

  //get xbar and sse for heap
  function calculateHeapStatistics(fxbar) {
    //continuously update heap xbar and heap se
    //we will assume that the heapxbar and heapse start at 0 
    heapN += 1;
    m = heapN //for use in formula - a bit shorter

    heapxbar = ( (1 - 1/m) * heapxbar) + (1/m * fxbar);
  
    if (m > 1) heapse = Math.sqrt (  ( (1 - 1/(m-1)) * (heapse * heapse) ) + ( (m)/((m-1) * (m-1)) * (fxbar - heapxbar) * (fxbar - heapxbar)  )  ); 
    
    //display values
    $heapxbar.text(heapxbar.toFixed(2));
    $heapse.text(heapse.toFixed(2));
    $noInHeap.text(heapN);


    //alternative  to calculating heap statistics - seems to compare really well with above. DON'T  delete yet.
    // xbardata.push(fxbar);
    // let hpm = 0, hps = 0, hn = 0;
    // xbardata.forEach( v => {
    //   hpm += v;
    //   hn  += 1;
    // })
    // hpm = hpm/hn;

    // xbardata.forEach( v => {
    //   hps += (v - hpm) * (v - hpm);
    // })
    // hps = Math.sqrt( hps/(hn-1) );

  }  

  //create the bins for a histogram to hold frequency data for the heap
  function resetHeap() {
    let noOfBuckets;

    d3.selectAll('.heap').remove();
    d3.selectAll('.selines').remove();
    removeMeanHeapCurve();

    heapxbar = 0;      
    $heapxbar.text(0);
     
    heapse   = 0; 
    $heapse.text(0);
    

    heapN    = 0;
    $noInHeap.text(0);

    //create a frequency distribution where the number of buckets is dependent on the width of the display area and the size of the sample mean
    heap = [];
    noOfBuckets = parseInt(xmax / (2 * sampleMeanSize));
    for (let xx = 0; xx <= noOfBuckets; xx += 1) {  
      heap.push({x: xx, f: 0})
    }

    xbardata = [];

  }


  //draw a normal curve to the heap
  function drawMeanHeapCurve() {
    //only do this if showMeanHeapCurve checked
    if (!showMeanHeapCurve) return; //simple way of dealing with it.

    d3.selectAll('.heapcurve').remove();
    //also gets re-created every time a sample is dropped

    //get max of the heap histogram i.e. the max frequency
    heapMax = Math.max(...heap.map(o => o.f), 0);

    //now create the points, 200 should be enough
    if (heapN > 1) {
      heappdf = [];
      for (let k = 0; k < 200; k++) { 
         //heappdf.push( {x: k, y: jStat.normal.pdf(k, heapxbar, heapse) } );  
         heappdf.push( {x: k, y: jStat.normal.pdf( k, mu, sigma/Math.sqrt(n) ) } ); 
      }

      //get the max of the curve
      heapCMax = Math.max(...heappdf.map(o => o.y), 0);

      //now scale the heappdf by heapMax/heapCMax   sampleMeanSize is the radius of the bubbles scale by 1.2
      //heappdf = heappdf.map (o =>  ({ x: o.x, y: o.y * heapMax/heapCMax * sampleMeanSize * 1.2 * 2}) );  
      heappdf = heappdf.map (o =>  ({ x: o.x, y: o.y * heapMax/heapCMax * sampleMeanSize * 2.0}) );  

      //create a generator
      lineh = d3.line()
                .x(function(d, i) { return x(d.x); })
                .y(function(d, i) { return heightS - d.y - 40; })
                .curve(d3.curveCardinal);  //curve it more as too pointy

      //display the curve
      svgS.append('path').attr('class', 'heapcurve').attr('d', lineh(heappdf)).attr('stroke', 'brown').attr('stroke-width', '2').attr('fill', 'none').attr('visibility', 'hidden');

      if (showMeanHeapCurve) {
        d3.selectAll('.heapcurve').attr('visibility', 'visible');
      }
      else {
        d3.selectAll('.heapcurve').attr('visibility', 'hidden');
      }

    }
  }

  function removeMeanHeapCurve() {
    d3.selectAll('.heapcurve').remove();
  }

  //draw the standard error line
  function drawSELines() {
    if (!showSELines) return;

    //remove previous SE lines
    d3.selectAll('.selines').remove();

    //draw the se lines, remember x() is a scaling function from D3
    //get height of heap
    hght = 0;
    for (let h = 0; h < heap.length; h += 1) {
      if (heap[h].f > hght) hght = heap[h].f;
    }
    hght *= 2 * sampleMeanSize;

    let ya = heightS - dropLimit;
    let yb = heightS - hght - 50;

    //xbar
    svgS.append('line').attr('class', 'selines').attr('x1', x(mu)).attr('y1', ya).attr('x2', x(mu)).attr('y2', yb).attr('stroke', 'orange').attr('stroke-width', '2').attr('visibility', 'hidden');
    //se
    // svgS.append('line').attr('class', 'selines').attr('x1', x(heapxbar-3*heapse)).attr('y1', ya).attr('x2', x(heapxbar-3*heapse)).attr('y2', yb).attr('stroke', 'orange').attr('stroke-width', '1').attr('visibility', 'hidden');
    // svgS.append('line').attr('class', 'selines').attr('x1', x(heapxbar-2*heapse)).attr('y1', ya).attr('x2', x(heapxbar-2*heapse)).attr('y2', yb).attr('stroke', 'orange').attr('stroke-width', '1').attr('visibility', 'hidden');
    // svgS.append('line').attr('class', 'selines').attr('x1', x(heapxbar - heapse)).attr('y1', ya).attr('x2', x(heapxbar - heapse)).attr('y2', yb).attr('stroke', 'orange').attr('stroke-width', '1').attr('visibility', 'hidden');
    // svgS.append('line').attr('class', 'selines').attr('x1', x(heapxbar+1*heapse)).attr('y1', ya).attr('x2', x(heapxbar+1*heapse)).attr('y2', yb).attr('stroke', 'orange').attr('stroke-width', '1').attr('visibility', 'hidden');
    // svgS.append('line').attr('class', 'selines').attr('x1', x(heapxbar+2*heapse)).attr('y1', ya).attr('x2', x(heapxbar+2*heapse)).attr('y2', yb).attr('stroke', 'orange').attr('stroke-width', '1').attr('visibility', 'hidden');
    // svgS.append('line').attr('class', 'selines').attr('x1', x(heapxbar+3*heapse)).attr('y1', ya).attr('x2', x(heapxbar+3*heapse)).attr('y2', yb).attr('stroke', 'orange').attr('stroke-width', '1').attr('visibility', 'hidden');
    sepopn = sigma/Math.sqrt(n);
    svgS.append('line').attr('class', 'selines').attr('x1', x(mu-3*sepopn)).attr('y1', ya).attr('x2', x(mu-3*sepopn)).attr('y2', yb).attr('stroke', 'orange').attr('stroke-width', '2').attr('visibility', 'hidden');
    svgS.append('line').attr('class', 'selines').attr('x1', x(mu-2*sepopn)).attr('y1', ya).attr('x2', x(mu-2*sepopn)).attr('y2', yb).attr('stroke', 'orange').attr('stroke-width', '2').attr('visibility', 'hidden');
    svgS.append('line').attr('class', 'selines').attr('x1', x(mu - sepopn)).attr('y1', ya).attr('x2', x(mu - sepopn)).attr('y2', yb).attr('stroke', 'orange').attr('stroke-width', '2').attr('visibility', 'hidden');
    svgS.append('line').attr('class', 'selines').attr('x1', x(mu+1*sepopn)).attr('y1', ya).attr('x2', x(mu+1*sepopn)).attr('y2', yb).attr('stroke', 'orange').attr('stroke-width', '2').attr('visibility', 'hidden');
    svgS.append('line').attr('class', 'selines').attr('x1', x(mu+2*sepopn)).attr('y1', ya).attr('x2', x(mu+2*sepopn)).attr('y2', yb).attr('stroke', 'orange').attr('stroke-width', '2').attr('visibility', 'hidden');
    svgS.append('line').attr('class', 'selines').attr('x1', x(mu+3*sepopn)).attr('y1', ya).attr('x2', x(mu+3*sepopn)).attr('y2', yb).attr('stroke', 'orange').attr('stroke-width', '2').attr('visibility', 'hidden');

    if (showSELines) {
      d3.selectAll('.selines').attr('visibility', 'visible');
    }
    else {
      d3.selectAll('.selines').attr('visibility', 'hidden');
    }
  }

  //draw the +/- bars
  function drawPlusMinusMoe() {
    pci = jStat.normalci( mu, alpha, sigma, n );
    d3.selectAll('.plusminusmoe').remove();
    if (plusminusmoe) {
      //get height of heap, not wanted now, but leave it in
      // hght = 0;
      // for (let h = 0; h < heap.length; h += 1) {
      //   if (heap[h].f > hght) hght = heap[h].f;
      // }
      // hght *= 2 * sampleMeanSize;
      let ya = heightS - dropLimit + 2;
      // let yb = heightS - hght - 50;

      //draw bottom bar and moe lines  //note ys() doesn't reverse scale - used heightS - y()
      svgS.append('line').attr('class', 'plusminusmoe').attr('x1', x(pci[0])).attr('y1', ya).attr('x2', x(pci[1])).attr('y2', ya).attr('stroke', 'green').attr('stroke-width', '4').attr('visibility', 'visible');
      //growing version not wanted
      // svgS.append('line').attr('class', 'plusminusmoe').attr('x1', x(pci[0])).attr('y1', ya).attr('x2', x(pci[0])).attr('y2', yb ).attr('stroke', 'green').attr('stroke-width', '2').attr('visibility', 'visible');
      // svgS.append('line').attr('class', 'plusminusmoe').attr('x1', x(pci[1])).attr('y1', ya).attr('x2', x(pci[1])).attr('y2', yb ).attr('stroke', 'green').attr('stroke-width', '2').attr('visibility', 'visible');
      
      //fixed height version
      svgS.append('line').attr('class', 'plusminusmoe').attr('x1', x(pci[0])).attr('y1', ya).attr('x2', x(pci[0])).attr('y2', 25 ).attr('stroke', 'green').attr('stroke-width', '2').attr('visibility', 'visible');
      svgS.append('line').attr('class', 'plusminusmoe').attr('x1', x(pci[1])).attr('y1', ya).attr('x2', x(pci[1])).attr('y2', 25 ).attr('stroke', 'green').attr('stroke-width', '2').attr('visibility', 'visible');
    }
  }

  /*-------------------------------------------elements and values---------------------------------*/

  //#region respond to all click and select events

  //change in mu textbox
  $mu.on('change', function() {
    mu = parseInt($mu.val());
    $("#muslider").val(mu);

    resetHeap();
    resetDisplay();
    setOldMu();
  })

  //mu slider
  $muslider.on('change', function() {
    mu = parseInt($muslider.val());
    $mu.val(mu);

    resetHeap();
    resetDisplay();
    setOldMu();
  })

  //change in sigma textbox
  $sigma.on('change', function() {
    sigma = parseInt($sigma.val());
    $("#sigmaslider").val(sigma);

    resetDisplay();
    seOldSigma();
  })

  //sigma slider
  $sigmaslider.on('change', function() {
    sigma = parseInt($sigmaslider.val());
    $sigma.val(sigma);

    resetDisplay();
    setOldSigma();
  })

  function setOldMu() {
    if (normal)      normalmu    = mu;
    if (rectangular) rectmu      = mu;
    if (skew)        skewmu      = mu;
    if (custom)      custommu   = mu;
  }

  function setOldSigma() {
    if (normal)      normalsigma = sigma;
    if (rectangular) rectsigma   = sigma;
    if (skew)        skewsigma   = sigma;
    if (custom)      customsigma = sigma;
  }


  function resetDisplay() {
    //remove sample points from DOM
    d3.selectAll('.samplepoint').remove();

    //remove any bubbles from DOM
    removePopnBubbles();

    //remove dropped sample means and moes
    d3.selectAll('.smean').remove();
    d3.selectAll('.pmoe').remove();
    d3.selectAll('.smoe').remove();

    resetSampleStats();
    resetCaptureStats();
    drawPopulationCurve();  //includes redrawing of mean an sd lines
    if (fillPopulation) fillPopnBubbles();

  }

  //normal radio button clicked
  $normal.on('change', function() {
    normal = $normal.is(':checked');
    rectangular = false;
    skew = false;
    custom = false;
    changedDistribution = true;

    //reset percentages captures
    clearAll();
    drawPopulationCurve();
  })

  //rectangular
  $rectangular.on('change', function() {
    rectangular = $rectangular.is(':checked');
    normal = false;
    skew = false;
    custom = false;
    changedDistribution = true;
    //reset percentages captures
    clearAll();
    drawPopulationCurve();
  })

  //skew
  $skew.on('change', function() {
    skew = $skew.is(':checked');
    normal = false;
    rectangular = false;
    custom = false;
    changedDistribution = true;
    clearAll();    
    drawPopulationCurve();
  })

  //custom
  $custom.on('change', function() {
    custom = $custom.is(':checked');
    normal = false;
    rectangular = false;
    skew = false;
    changedDistribution = true;
    clearAll();    
    drawPopulationCurve();
  })

  //skew amount
  $skewAmount.on('change', function() {
    skewAmount = parseFloat($skewAmount.val());

    clearAll();
    drawPopulationCurve();
  })

  //show population pdf curve
  $showPopulationCurve.on('change', function() {
    showPopulationCurve = $showPopulationCurve.is(':checked');
    if (showPopulationCurve) {
      drawPopulationCurve();
    } 
    else {
      removePopulationCurve();
      removePopnBubbles();
      $fillPopulation.prop('checked', false);
      fillPopulation = false;
    }
  })

  //show mu and sd lines
  $showSDLines.on('change', function() {
    showSDLines = $showSDLines.is(':checked');
    if (showSDLines) drawSDLines(); else removeSDLines();
  })

  //fill the distribution with sample 'bubbles'
  $fillPopulation.on('change', function() {
    fillPopulation = $fillPopulation.is(':checked');
    if (fillPopulation) {
      fillPopnBubbles();
    } 
    else {
      removePopnBubbles();
    }
  })

  //take one sample
  $takeSample.on('click', function() {
    takeSample();
  })

  //run freely
  $runFreely.on('click', function() {
    if (!runFreely) {
      runFreely = true;
      $runFreely.css('background-color', 'red');
      $runFreely.text('Stop');
      //now trigger the TakeSample code
      triggerTakeSample = setInterval(takeSample, speed);
    }
    else {
      runFreely = false;
      $runFreely.css('background-color', 'rgb(148, 243, 148)');
      $runFreely.text('Run Stop');
      //now stop the triggering
      clearInterval(triggerTakeSample);
    }
  })

  //if slider for speed changes
  $speed.on('change', function() {
    speed = parseInt( $('#speed').val() );
    if (runFreely) {
      clearInterval(triggerTakeSample);
      triggerTakeSample = setInterval(takeSample, speed);
    }
    else {
      //don't do anything
    }
  })

  //size of sample
  $n.on('change', function() {
    n = parseInt( $('#samplesselected option:selected').val() );

    //clear everything
    clearAll();

    //redisplay +/- moe if sample size changes
    if (plusminusmoe) drawPlusMinusMoe();
  })

  //show sample points
  $showSamplePoints.on('change', function() {
    showSamplePoints = $showSamplePoints.is(':checked');
    if (showSamplePoints) {
      d3.selectAll('.samplepoint').attr('visibility', 'visible');
    }
    else {
      d3.selectAll('.samplepoint').attr('visibility', 'hidden');
    }
  })

  //show the sample means
  $showSampleMeans.on('change', function() {
    showSampleMeans = $showSampleMeans.is(':checked');
    if (showSampleMeans) {
      d3.selectAll('.smean').attr('visibility', 'visible');
    }
    else {
      d3.selectAll('.smean').attr('visibility', 'hidden');
      //deselect dropping means as well
      $dropSampleMeans.prop('checked', false);
      dropSampleMeans = $dropSampleMeans.is(':checked');
      removeDroppingMeans();
    }

  })

  //allow means to drop
  $dropSampleMeans.on('change', function() {
    if (!showSampleMeans) {  //cant have drop means if sample mean not selected
      $dropSampleMeans.prop('checked', false);
      return;
    }
    dropSampleMeans = $dropSampleMeans.is(':checked');
    if (dropSampleMeans) {
      resetCaptureStats();
    }
    else { //remove
      removeDroppingMeans();  //includes reset capturestats
    }
  })

  function removeDroppingMeans() {
    //I think removing all dropped means makes sense
    d3.selectAll('.smean').remove();
    d3.selectAll('.pmoe').remove();
    d3.selectAll('.smoe').remove();
    resetCaptureStats();
  }

  //Select confidence interval % and alpha
  $ci.on('change', function() {
    alpha = parseFloat($('#CI').val());
    displaySampleAppearanceAll();

    recalculateSamplemeanStatistics();
  })

  //show/hide the CI Moe bars?
  $showMoe.on('change', function() {
    showMoe = $showMoe.is(':checked');

    displaySampleAppearanceAll();
    recalculateSamplemeanStatistics(); //which turns on display of captured stats
  })

  //show moe wings for population
  $showPmoe.on('change', function() {
    showPmoe = $showPmoe.is(':checked');
    showSmoe = $showSmoe.is(':checked');
    displaySampleAppearanceAll();
    recalculateSamplemeanStatistics();
    //clear the mean heap if displayed  as will not match the CI  ???
    //resetHeap();
  })

  //show moe wings for sample
  $showSmoe.on('change', function() {
    showPmoe = $showPmoe.is(':checked');
    showSmoe = $showSmoe.is(':checked');
    displaySampleAppearanceAll();
    recalculateSamplemeanStatistics();
    //clear the mean heap if displayed as will not match the CI  ???
    //resetHeap();
  })

  //show the mean as not captured if known, uknown checked
  $captureOfMu.on('change', function() {
    captureOfMu = $captureOfMu.is(':checked');
    displaySampleAppearanceAll();
    recalculateSamplemeanStatistics();
  })


  $showMeanHeap.on('change', function() {
    showMeanHeap = $showMeanHeap.is(':checked');
    if (showMeanHeap) {
      d3.selectAll('.heap').attr('visibility', 'visible');
    }
    else {
      //should clear it all really
      resetHeap();
      d3.selectAll('.heap').attr('visibility', 'hidden');

      //also remove mean heap curve, no heap
      removeMeanHeapCurve();
      $showMeanHeapCurve.prop('checked', false);
      showMeanHeapCurve = false;
    }
  })

  //show sample distribution curve
  $showMeanHeapCurve.on('change', function() {
    if (!showMeanHeap) { //can only have a curve if there is a heap, if heap not checked there is no heap.
      $showMeanHeapCurve.prop('checked', false); 
      return;
    }

    showMeanHeapCurve = $showMeanHeapCurve.is(':checked');
    if (showMeanHeapCurve) {
      drawMeanHeapCurve();
    }
    else {
      removeMeanHeapCurve();
    }
  })

  //show sample mean and sample error lines
  $showSELines.on('change', function() {
    showSELines = $showSELines.is(':checked');
    if (showSELines) {
      d3.selectAll('.selines').attr('visibility', 'visible');
    }
    else {
      // d3.selectAll('.selines').attr('visibility', 'hidden');
      d3.selectAll('.selines').remove();
    }
  })

  $plusminusmoe.on('change', function() {
    plusminusmoe = $plusminusmoe.is(':checked');
    if (plusminusmoe) drawPlusMinusMoe();
  })


  //show mu line in dropping means area
  $showCaptureMuLine.on('change', function() {
    showCaptureMuLine = $showCaptureMuLine.is(':checked');
    if (showCaptureMuLine) {
      drawMuLine(); 
    }
    else {
      removeMuLine();
    }
    recalculateSamplemeanStatistics(); //which turns on or off display of captured stats
  })


  //Number capturing next mean
  $captureNextMean.on('change', function() {
    captureNextMean = $captureNextMean.is(':checked');
    if (captureNextMean) {
      $('#numbercapturingnextmean').show();
      $('#percentcapturingnextmean').show();
      $('#nocapturingnextmean').show();
      $('#pccapturingnextmean').show();
    }
    else {
      $('#numbercapturingnextmean').hide();
      $('#percentcapturingnextmean').hide();
      $('#nocapturingnextmean').hide();
      $('#pccapturingnextmean').hide();
    }
  })
  //#endregion

   //get values of all checkboxes, radio-buttons and text-boxes etc.
  function getInterfaceElements() {
    $muslider             = $('#muslider');
    $mu                   = $('#muvaluetext');
    $sigmaslider          = $('#sigmaslider');
    $sigma                = $('#sigmavaluetext');

    $normal               = $('#normal');
    $rectangular          = $('#rectangular');
    $skew                 = $('#skew');
    $skewAmount           = $('#skewvalue');
    $custom               = $('#custom');

    $showPopulationCurve  = $('#popn');
    $showSDLines          = $('#sdlines');
    $fillPopulation       = $('#fillpopn');

    $clear                = $('#clearsample');
    $takeSample           = $('#takesample');
    $runFreely            = $('#runfreely');
    $speed                = $('#speed');

    $n                    = $('#samplesselected');
    $N                    = $('#nosamplesx');
    $N2                   = $('#nosamplesy');

    $xbar                 = $('#samplemean');
    $ssd                  = $('#samplesd');
    $pmoe                 = $('#popnmoe');
    $smoe                 = $('#samplemoe');

    $showSamplePoints     = $('#datapoints')
    $showSampleMeans      = $('#samplemeans');
    $dropSampleMeans      = $('#droppingmeans');

    $ci                   = $('#CI');

    $showMoe              = $('#showmoe');
    $showPmoe             = $('#moepopn');
    $showSmoe             = $('#moesample');
    $captureOfMu          = $('#captureofmu');

    $captured             = $('#captured');
    $capturedpercent      = $('#capturedpercent');

    $showMeanHeap         = $('#meanheap');
    $showSELines          = $('#samplelines');
    $showMeanHeapCurve    = $('#samplecurve')

    $plusminusmoe         = $('#plusminusmoe');

    $heapxbar             = $('#xbarhp');
    $heapse               = $('#sehp');

    $noInHeap             = $('#numberinheap');

    $showCaptureMuLine    = $('#capturemuline');

    $captureNextMean      = $('#capturenextmean');

    $tooltipsonoff        = $('#tooltipsonoff');
  }

  //get the value or status of all ui interface elements (how many of these do I need at this place?)
  function getInterfaceValues() {
    mu                    = parseFloat($mu.val());
    sigma                 = parseFloat($sigma.val());

    normal                = $normal.is(':checked');
    rectangular           = $rectangular.is(':checked');
    skew                  = $skew.is(':checked');
    skewAmount            = $skewAmount.text();
    custom                = $custom.is(':checked');

    speed                 = parseInt($speed.val());

    showPopulationCurve   = $showPopulationCurve.is(':checked');
    showSDLines           = $showSDLines.is(':checked');
    fillPopulation        = $fillPopulation.is(':checked');

    n                     = parseInt($('#samplesselected option:selected').val());
    N                     = parseInt($N.text());

    xbar                  = parseFloat($xbar.text());  
    ssd                   = parseFloat($ssd.text()); 

    alpha                 = parseFloat($('#CI option:selected').val());

    showMoe               = $showMoe.is(':checked');
    pmoe                  = parseFloat($pmoe.text()); 
    smoe                  = parseFloat($smoe.text());  
    captureOfMu           = $captureOfMu.is(':checked');

    showSamplePoints      = $showSamplePoints.is(':checked');
    showSampleMeans       = $showSampleMeans.is(':checked');
    dropSampleMeans       = $dropSampleMeans.is(':checked');

    showPmoe              = $showPmoe.is(':checked');
    showSmoe              = $showSmoe.is(':checked');

    showMeanHeap          = $showMeanHeap.is(':checked');
    showSELines           = $showSELines.is(':checked');
    showMeanHeapCurve     = $showMeanHeapCurve.is(':checked');
    plusminusmoe          = $plusminusmoe.is(':checked');

    heapxbar              = parseFloat($heapxbar.text());
    heapse                = parseFloat($heapse.text());

    showCaptureMuLine     = $showCaptureMuLine.is(':checked');

    captureNextMean      = $captureNextMean.is('checked');

    //tooltipsonoff        = $tooltipsonoff.is('checked');

  }

  //not convinced this is the right way, but seems okay for now
  $(window).bind('resize', function(e){
    window.resizeEvt;
    $(window).resize(function(){
        clearTimeout(window.resizeEvt);
        window.resizeEvt = setTimeout(function(){
          setDisplay();
        }, 500);
    });
  });

  //helper function for testing
  function l(s) {
    console.log(s);
  }


/*---------------------------------------------------Tooltips-----------------------------------*/
  //tooltips
  //add a data-tooltip attribute to all tooltippable elements and then figure out which one was hovered over?
  //It's a first go and I don't like it!!! Still go the text at any rate.

  $tooltipsonoff.on('click', function() {
    if (tooltipsonoff) {
      tooltipsonoff = false;
      $tooltipsonoff.css('background-color', 'lightgrey');
    }
    else {
      tooltipsonoff = true;
      $tooltipsonoff.css('background-color', 'lightgreen');
    }
  })

  $('[data-tooltip]').on({ 
    mouseenter: function(e) {

      // e.preventDefault();
      // e.stopPropagation();
      $('#tooltip').hide();
      position = $(this).position();

      if (tooltipsonoff) {  //if tooltips allowed
        tooltipText = '';
        if ($(this).text().includes('1. The Population'))           tooltipText = 'Choose the parameters of the population and its shape.';
        if ($(this).text().includes('μ'))                           tooltipText = 'Population mean.  Use slider, or type in value.  Min 0, max 100.';
        if ($(this).text().includes('σ'))                           tooltipText = 'Standard deviation of the population.  Use slider or type in value.  Min 1, max 50.';
        if ($(this).text().includes('Shape'))                       tooltipText = 'Click to choose the shape of the population distribution: Normal, rectangular, or skewed to the right. For the skewed population, the degree of skew is controlled by the spinner at the right. Min = 0.1 (minimal skew), max = 1 (strong skew). The skewed distribution is a lognormal distribution, with the number displayed being the SD of the underlying normal distribution.';
        if ($(this).text().includes('Skew'))                        tooltipText = 'Use the spinner to set the degree of right skew, when Skew is chosen as the shape of the population distribution. Min 0.1, max 1.';
        if ($(this).text().includes('Custom'))                      tooltipText = 'Draw your own distribution.';
        if ($(this).text() === 'SD Lines')                          tooltipText = 'Display verticals to mark the mean, and s units either side of the mean.  These lines mark z=0, z=-1, z=1, etc.';
        if ($(this).text() === 'Fill Random')                       tooltipText = 'Click to fill under the population curve.  A large number of data circles are placed randomly in the area. \nA new randomisation is made each time Fill Random is clicked on.';
        if ($(this).text().includes('Controls'))                    tooltipText = "Click the three buttons to control sampling.";
        //I don't like tooltips appearing on buttons, must be a better way - hover for a second or two?
        // if ($(this).text().includes('Clear'))                       tooltipText = "'Clear' clears all samples.";
        // if ($(this).text().includes('Take Sample'))                 tooltipText = "Click to take another random, independent sample from the population.";
        // if ($(this).text().includes('Run Stop'))                    tooltipText = "Click to start and stop a sequence of samples.";
        if ($(this).text().includes('Samples'))                     tooltipText = 'Choose sample size, see information about the latest sample, and see the number of samples in the current set of samples.';
        if ($(this).text() === 'N')                                 tooltipText = 'Sample size.  Min 1, max 100.';
        if ($(this).text().includes('Number of samples'))           tooltipText = "Number of samples in the current set of samples. A new set is started after 'Clear', or whenever a major parameter (e.g., m, s, N), or display setting is changed.";
        if ($(this).text().includes('Mean'))                        tooltipText = 'The mean of the latest sample.';
        if ($(this).text().includes('SD'))                          tooltipText = 'The standard deviation of the latest sample.';
        if ($(this).text().includes('MoE (population)'))            tooltipText = 'Margin of error (MoE) of the population CI around the mean of the latest sample. The MoE is the length of either arm of the latest CI, so is half the total length of this CI.';
        if ($(this).text().includes('MoE (sample)'))                tooltipText = 'Margin of error (MoE) of the sample CI around the mean of the latest sample. The MoE is the length of either arm of the latest CI, so is half the total length of this CI.';
        if ($(this).text().includes('Data points'))                 tooltipText = 'Click to display data points (ooo) of the latest sample.';
        if ($(this).text().includes('Sample means'))                tooltipText = 'Display sample means as green dots.';
        if ($(this).text().includes('Dropping means'))              tooltipText = 'Click to display means as they drop. When mean heap is displayed, unclick here to see just the means in the mean heap.';
        if ($(this).text().includes('5. Mean Heap'))                tooltipText = 'The mean heap is a pile of the sample means in the current set of samples. Only the most recent ??? means are displayed.';
        if ($(this).text().includes('Mean heap'))                   tooltipText = 'Click to show the mean heap, a dot plot of sample means. Only the most recent ??? means in the current set of samples are displayed.';
        if ($(this).text().includes('Sampling distribution curve')) tooltipText = 'When the mean heap is displayed: The sampling distribution curve is the shape of the mean heap expected if we took an infinite number of samples, and the population is normal.  The sampling distribution curve is a normal distribution.  It is scaled vertically to match the number of samples in the current set of samples. When the population is rectangular, the displayed normal sampling distribution curve is usually a good fit to the mean heap for a large number of samples, because of the central limit theorem. For a skewed population the fit is sometimes not so close, especially for small samples and a highly skewed population.';
        if ($(this).text().includes('SE lines'))                    tooltipText = 'When the mean heap is displayed: Display verticals to mark m , and SE units either side of m.  These lines mark z=0, z=-1, z=1, etc, for the sampling distribution curve.';
        if ($(this).text().includes('MoE around μ'))                tooltipText = 'This interval marks the central C% area under the sampling distribution curve.  It is marked by a green bar along the X axis, with green verticals to mark its ends. When s is assumed known, this interval gives the width of every CI.';
        if ($(this).text().includes('6. Confidence Intervals'))     tooltipText = 'CIs can be displayed on every mean in the dance of the means, to give the dance of the confidence intervals';
        if ($(this).text().includes('CI%'))                         tooltipText = 'Confidence level (%) for CIs displayed on the sample means.  Use spinner or type in a value.  Min 0, max 99.9';
        if ($(this).text().includes('CIs'))                         tooltipText = 'Display a CI on every mean in the dance of the means, to see the dance of the confidence intervals';
        if ($(this).text().includes('Known'))                       tooltipText = 'The population sd is known.';
        if ($(this).text().includes('Unknown'))                     tooltipText = 'The population sd is unknown.';
        if ($(this).text().includes('7. Capture of μ'))             tooltipText = 'When the mean heap is not displayed: Explore capture of μ by CIs. Click both checkboxes to mark the population mean μ, and see red when a CI does not capture μ.';
        if ($(this).text().includes('μ line'))                      tooltipText = 'A vertical line to mark the population mean in the lower figure';
        if ($(this).text().includes('Capture of μ'))                tooltipText = 'When the mean heap is not displayed: Click to indicate capture by the CIs of μ.  Red indicates non-capture.';
        if ($(this).text().includes('Heap mean'))                   tooltipText = 'The mean of the heap at after each sample';
        if ($(this).text().includes('Heap se'))                     tooltipText = 'The standard error of the heap after each sample';
        if ($(this).text().includes('Number capturing μ'))          tooltipText = 'Number of samples in the current set of samples for which the CI captures μ';
        if ($(this).text().includes('Samples taken'))               tooltipText = 'Total number of sample taken (re-displayed from section 4)';
        if ($(this).text().includes('Percent capturing μ'))         tooltipText = 'Percent of samples in the current set of samples for which the CI captures μ.  This proportion is expected in the long run to equal % confidence (C).  ';
        if ($(this).text().includes('8. Capture of next mean'))     tooltipText = 'NOT IMPLEMENTED YET!! When the mean heap is not displayed: Explore capture by CIs of the next mean, which is the mean just above a CI in the dance. When the checkbox is clicked on, then cases where the next mean falls outside the CI are indicated by a pink diagonal line joining the closer limit of the CI to that next mean just above.';
        if ($(this).text().includes('Number capturing next mean'))  tooltipText = 'Number of samples in the current set of samples for which the CI captures the next mean, which is the mean just above it in the dance.';
        if ($(this).text().includes('Percent capturing next mean')) tooltipText = 'When the mean heap is not displayed: Click to show a pink diagonal line joining the  closer limit of the CI to the next mean, which is the mean just above, in all cases in which the CI does not capture that next mean. In the long run, we expect about 83% of 95% CIs to capture the next mean.';
        // if ($(this).text().includes('')) tooltipText = '';
        // if ($(this).text().includes('')) tooltipText = '';

        $('#tooltip').css( { left: position.left + 20, top: position.top +20 } )
        $('#tooltip').text(tooltipText).show(500);
      }
    },
    mouseleave: function() {
      $('#tooltip').hide();
    },
    click: function() {
      $('#tooltip').hide();
    },
    touch: function() {
      $('#tooltip').hide();
    }
  })


}) //end of jQuery
//}) //end of window.load

//ref for specific code samples.
//https://stackoverflow.com/questions/2854407/javascript-jquery-window-resize-how-to-fire-after-the-resize-is-completed

//ref for continuously updating the mean and sd
//https://www.physicsforums.com/threads/updating-the-mean-and-sd-of-a-set-efficiently.526280/ https://www.physicsforums.com/threads/updating-the-mean-and-sd-of-a-set-efficiently.526280/ 