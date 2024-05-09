/*****************************/
/** concluido el 24/11/2021 **/
/*****************************/

var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    pool: true, // This is the field you need to add
    auth: {
        user: 'sistemas@geo.com.gt',
        //pass: '4L3j4ndr0*'
        pass: '4n41s4b3l*'
    }
});

var request = require('request');
var sql = require("mssql");
var configSQL = {
    user: 'sapdbusr',
    password: 'SisLo6%0158',
    server: '10.0.0.2',
    //server: '192.168.0.8',
    database: 'SBO_Sistemas_Logisticos',
    //database: 'Pruebas',
    debug: true,
    options: {
        encrypt: true // Use this if you're on Windows Azure
    }
};

const {
    toJs
} = require('xml-vs-js')

var facturas = []
var get_DTE_variables_query = function(array_dn) {
    console.log("array_dn",array_dn)
    if(array_dn != '') {
        var queryString = `
        SELECT * 
        FROM [SBO_Sistemas_Logisticos].[dbo].[VW_FELFACTURA] 
        --FROM [Pruebas].[dbo].[VW_FELFACTURA] 
        WHERE SeieSAP IN (236,237,214,239,238,241,247)
        AND DocNum in (`+array_dn+`000)`
        console.log("queryString",queryString)
        var pool = new sql.ConnectionPool(configSQL)
        pool.connect().then(_ => {
            return pool.request().query(queryString)
        }).then(result => {
            facturas = []
            facturas = result.recordset;
            limite_muestra = facturas.length
            insertar()
        });
    } else {
        console.log("no hay DTE")
    }

}

var listar_docnum = function() {
    var queryString = `
        SELECT top 1 max(DocNum) DocNum, max(TipoDocumento) TipoDocumento, max(fechaemision) fechaemision
        FROM [SBO_Sistemas_Logisticos].[dbo].[VW_FELFACTURA]
        --FROM [Pruebas].[dbo].[VW_FELFACTURA]
        WHERE fechaemision > DATEADD(day, -5, GETDATE())
        AND fechaemision < DATEADD(day, 5, GETDATE())
        AND SeieSAP IN (236,237,214,239,238,241,247)
        GROUP BY DocNum
        ORDER BY TipoDocumento ASC, fechaemision ASC`
    var pool = new sql.ConnectionPool(configSQL)
    pool.connect().then(_ => {
        return pool.request().query(queryString)
    }).then(result => {
        lista_facturas = result.recordset;
        var array_doc_num = ""
        for(var i=0; i< lista_facturas.length; i++) {
            array_doc_num += lista_facturas[i].DocNum+",";
        }
        get_DTE_variables_query(array_doc_num)
    });

}

var indice_actualizacion = 0
var limite_muestra = 7
var agrupar_registros = 0
var DocNum_inicial = 0
var grupo_items_f = []

var agrupar = function() {
    if(DocNum_inicial == 0) {
        DocNum_inicial = facturas[indice_actualizacion].DocNum
        console.log("DocNum_inicial",DocNum_inicial)
    }
    if((typeof facturas[indice_actualizacion] !== 'undefined')&&(DocNum_inicial == facturas[indice_actualizacion].DocNum)) {
        grupo_items_f.push({
            codigoServicio: facturas[indice_actualizacion].CodigoServicio,
            BienOServicio: facturas[indice_actualizacion].BienOServicio,
            NumeroLinea: facturas[indice_actualizacion].NumeroLinea,
            iCantidad: facturas[indice_actualizacion].iCantidad,
            UnidadMedida: facturas[indice_actualizacion].UnidadMedida,
            Descripcion: facturas[indice_actualizacion].Descripcion,
            ComentarioItem: facturas[indice_actualizacion].ComentarioItem,
            PrecioUnitario: facturas[indice_actualizacion].PrecioUnitario,
            Precio: facturas[indice_actualizacion].Precio,
            Decuento: facturas[indice_actualizacion].Decuento,
            NombreCorto: facturas[indice_actualizacion].NombreCorto,
            CodigoUnidadGravable: facturas[indice_actualizacion].CodigoUnidadGravable,
            MontoGravable: facturas[indice_actualizacion].MontoGravable,
            MontoImpuesto: facturas[indice_actualizacion].MontoImpuesto,
            iTotal: facturas[indice_actualizacion].iTotal
        })
        if(indice_actualizacion++ < limite_muestra) {
            agrupar()
        }
    }
    return grupo_items_f
}

function addDays(date, days) {
    var result = date // new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

var insertar = function() {
    DocNum_inicial = 0
    grupo_items_f = []
    var grupo_items = agrupar()
    if(indice_actualizacion == facturas.length || typeof facturas[indice_actualizacion-1] !== 'undefined') {
        U_Name_Error = facturas[indice_actualizacion-1].NombreReceptor
        U_DocNum_Error = facturas[indice_actualizacion-1].DocNum
        U_Error_TD = facturas[indice_actualizacion-1].TipoDocumento


        /*** 
         * console.log(
            "FechaEmision",facturas[indice_actualizacion-1].FechaEmision,
            "FechaBase",facturas[indice_actualizacion-1].FechaBase,
            "FechaVencimiento",facturas[indice_actualizacion-1].FechaVencimiento
        ) ***/

        facturas[indice_actualizacion-1].FechaEmision = addDays(facturas[indice_actualizacion-1].FechaEmision,1) 
        // facturas[indice_actualizacion-1].FechaBase = (facturas[indice_actualizacion-1].FechaBase == null ? null : addDays(facturas[indice_actualizacion-1].FechaBase,1)) 
        // facturas[indice_actualizacion-1].FechaVencimiento = (facturas[indice_actualizacion-1].FechaVencimiento == null ? null : addDays(facturas[indice_actualizacion-1].FechaVencimiento,1))

        /*** console.log(
            "FechaEmision",facturas[indice_actualizacion-1].FechaEmision,
            "FechaBase",facturas[indice_actualizacion-1].FechaBase,
            "FechaVencimiento",facturas[indice_actualizacion-1].FechaVencimiento
        ) ***/

     


        var jsonDTEVariables = {
            DocCur: facturas[indice_actualizacion-1].DocCur,
            TipoDocumento: facturas[indice_actualizacion-1].TipoDocumento,
            DocNum: facturas[indice_actualizacion-1].DocNum,
            //FechaEmision: facturas[indice_actualizacion-1].FechaEmision.getFullYear()+"-"+("0"+(facturas[indice_actualizacion-1].FechaEmision.getMonth()+1)).slice(-2)+"-"+("0"+(facturas[indice_actualizacion-1].FechaEmision.getDate()+0)).slice(-2), 
            FechaEmision: facturas[indice_actualizacion-1].AnoEmision +"-"+ facturas[indice_actualizacion-1].MesEmision +"-"+ facturas[indice_actualizacion-1].DiaEmision, //adrian
            HoraEmision: ""+facturas[indice_actualizacion-1].HoraEmision,
            CorreoReceptor: facturas[indice_actualizacion-1].CorreoReceptor,
            IDRecepor: facturas[indice_actualizacion-1].IDRecepor,
            NombreReceptor: facturas[indice_actualizacion-1].NombreReceptor,
            DireccionReceptor: facturas[indice_actualizacion-1].DireccionReceptor,
            DireccionReceptorEspecial: facturas[indice_actualizacion-1].DireccionReceptorEspecial,
            CodigoPostalReceptor: facturas[indice_actualizacion-1].CodigoPostalReceptor,
            MunicipioReceptor: facturas[indice_actualizacion-1].MunicipioReceptor,
            DepartamentoReceptor: facturas[indice_actualizacion-1].DepartamentoReceptor,
            PaisReceptor: facturas[indice_actualizacion-1].PaisReceptor,
            grupo_items: grupo_items,
            TotalMontoImpuesto: facturas[indice_actualizacion-1].TotalMontoImpuesto,
            GranTotal: facturas[indice_actualizacion-1].GranTotal,
            RetencionISR: facturas[indice_actualizacion-1].RetencionISR,
            RetencionIVA: facturas[indice_actualizacion-1].RetencionIVA,
            ComentarioDoc: facturas[indice_actualizacion-1].ComentarioDoc,
            //FechaBase: (facturas[indice_actualizacion-1].FechaBase == null ? "" : facturas[indice_actualizacion-1].FechaBase.getFullYear()+"-"+("0"+(facturas[indice_actualizacion-1].FechaBase.getMonth()+1)).slice(-2)+"-"+("0"+(facturas[indice_actualizacion-1].FechaBase.getDate()+0)).slice(-2)), 
            FechaBase: (facturas[indice_actualizacion-1].FechaBase == null ? "" : facturas[indice_actualizacion-1].AnoBase +"-"+ facturas[indice_actualizacion-1].MesBase +"-"+ facturas[indice_actualizacion-1].DiaBase), //adrian
            HoraBase: ""+facturas[indice_actualizacion-1].HoraBase,
            UUIdBase: facturas[indice_actualizacion-1].UUIdBase,
            ResolucionGFACE: facturas[indice_actualizacion-1].ResolucionGFACE,
            NumeroBase: facturas[indice_actualizacion-1].NumeroBase,
            SerieBase: facturas[indice_actualizacion-1].SerieBase,
            NumeroDeAbono: facturas[indice_actualizacion-1].NumeroDeAbono,
            //FechaVencimiento: (facturas[indice_actualizacion-1].FechaVencimiento == null ? "" : facturas[indice_actualizacion-1].FechaVencimiento.getFullYear()+"-"+("0"+(facturas[indice_actualizacion-1].FechaVencimiento.getMonth()+1)).slice(-2)+"-"+("0"+(facturas[indice_actualizacion-1].FechaVencimiento.getDate()+1)).slice(-2)), 
            FechaVencimiento: (facturas[indice_actualizacion-1].FechaVencimiento == null ? "" : facturas[indice_actualizacion-1].AnoVencimiento +"-"+ facturas[indice_actualizacion-1].MesVencimiento +"-"+ facturas[indice_actualizacion-1].DiaVencimiento), //adrian
            MontoDeAbono: facturas[indice_actualizacion-1].MontoDeAbono,
            IdPlantilla: facturas[indice_actualizacion-1].IdPlantilla
        }
        to_table_fel(jsonDTEVariables)
    }
}

var to_table_fel_continue = function(body) {
    console.log(" - - - paso 4 - - - ")
    var respuesta = body
    if(typeof respuesta.seriedocumento !== 'undefined') {
        console.log(" - - - paso 5 - - - ")
        var queryUString = "";
        // 09/05/2024 Jcorona, se agrega nueva variable NumAtCardlocal y se agrega a la columna NumAtCard
        var NumAtCardlocal = respuesta.seriedocumento+'-'+respuesta.numerodocumento
        if( respuesta.TipoDocumento == 'FC'  ) 
            { 
                queryUString = `update oinv set U_DoctoSerie = '`+respuesta.seriedocumento+`', U_DoctoNo = '`
                +respuesta.numerodocumento+`', U_DoctorSerie = '`+respuesta.uuid+`', NumAtCard = '`+ NumAtCardlocal+`' where DocNum = `+respuesta.docnum; 
            }
        if( respuesta.TipoDocumento == 'FCE' ) { queryUString = `update opch set U_DoctoSerie = '`+respuesta.seriedocumento+`', U_DoctoNo = '`+respuesta.numerodocumento+`', U_DoctorSerie = '`+respuesta.uuid+`', NumAtCard = '`+ NumAtCardlocal+`' where DocNum = `+respuesta.docnum; }
        if( respuesta.TipoDocumento == 'NC'  ) { queryUString = `update orin set U_DoctoSerie = '`+respuesta.seriedocumento+`', U_DoctoNo = '`+respuesta.numerodocumento+`', U_DoctorSerie = '`+respuesta.uuid+`', NumAtCard = '`+ NumAtCardlocal+`' where DocNum = `+respuesta.docnum; }
        if( respuesta.TipoDocumento == 'NAB' ) { queryUString = `update orin set U_DoctoSerie = '`+respuesta.seriedocumento+`', U_DoctoNo = '`+respuesta.numerodocumento+`', U_DoctorSerie = '`+respuesta.uuid+`', NumAtCard = '`+ NumAtCardlocal+`' where DocNum = `+respuesta.docnum; }
        if( respuesta.TipoDocumento == 'ANC' ) { queryUString = `update orin set U_DoctoSerie = '`+respuesta.seriedocumento+`', U_DoctoNo = '`+respuesta.numerodocumento+`', U_DoctorSerie = '`+respuesta.uuid+`', NumAtCard = '`+ NumAtCardlocal+`' where DocNum = `+respuesta.docnum+`; update [SBO_Sistemas_Logisticos].[dbo].[@FEL] set U_anulada = 1 where Code='`+respuesta.UUIdBase+`';`; }
        if( respuesta.TipoDocumento == 'ANAB') { queryUString = `update orin set U_DoctoSerie = '`+respuesta.seriedocumento+`', U_DoctoNo = '`+respuesta.numerodocumento+`', U_DoctorSerie = '`+respuesta.uuid+`', NumAtCard = '`+ NumAtCardlocal+`' where DocNum = `+respuesta.docnum+`; update [SBO_Sistemas_Logisticos].[dbo].[@FEL] set U_anulada = 1 where Code='`+respuesta.UUIdBase+`';`; }
        if( respuesta.TipoDocumento == 'AFC' ) { queryUString = `update oinv set U_DoctoSerie = '`+respuesta.seriedocumento+`', U_DoctoNo = '`+respuesta.numerodocumento+`', U_DoctorSerie = '`+respuesta.uuid+`', NumAtCard = '`+ NumAtCardlocal+`' where DocNum = `+respuesta.docnum+`; update [SBO_Sistemas_Logisticos].[dbo].[@FEL] set U_anulada = 1 where Code='`+respuesta.UUIdBase+`';`; }
        //if( respuesta.TipoDocumento == 'ANC' ) { queryUString = `update orin set U_DoctoSerie = '`+respuesta.seriedocumento+`', U_DoctoNo = '`+respuesta.numerodocumento+`', U_DoctorSerie = '`+respuesta.uuid+`' where DocNum = `+respuesta.docnum+`; update [Pruebas].[dbo].[@FEL] set U_anulada = 1 where Code='`+respuesta.UUIdBase+`';`; }
        //if( respuesta.TipoDocumento == 'ANAB') { queryUString = `update orin set U_DoctoSerie = '`+respuesta.seriedocumento+`', U_DoctoNo = '`+respuesta.numerodocumento+`', U_DoctorSerie = '`+respuesta.uuid+`' where DocNum = `+respuesta.docnum+`; update [Pruebas].[dbo].[@FEL] set U_anulada = 1 where Code='`+respuesta.UUIdBase+`';`; }
        //if( respuesta.TipoDocumento == 'AFC' ) { queryUString = `update oinv set U_DoctoSerie = '`+respuesta.seriedocumento+`', U_DoctoNo = '`+respuesta.numerodocumento+`', U_DoctorSerie = '`+respuesta.uuid+`' where DocNum = `+respuesta.docnum+`; update [Pruebas].[dbo].[@FEL] set U_anulada = 1 where Code='`+respuesta.UUIdBase+`';`; }
        console.log('queryUString', queryUString)
        var pool = new sql.ConnectionPool(configSQL)
        pool.connect().then(_ => {
            return pool.request().query(queryUString)
        }).then(result => {
            var queryIString = `INSERT INTO [SBO_Sistemas_Logisticos].[dbo].[@FEL] ([Code],[Name],[U_DocNum],[U_NIT],[U_Serie],[U_TipoDocumento],[U_UUID]) VALUES ('`+respuesta.seriedocumento+`-`+respuesta.numerodocumento+`','`+respuesta.numerodocumento+`','`+respuesta.docnum+`','`+respuesta.nit+`','`+respuesta.seriedocumento+`','`+respuesta.TipoDocumento+`','`+respuesta.uuid+`')`
            //var queryIString = `INSERT INTO [Pruebas].[dbo].[@FEL] ([Code],[Name],[U_DocNum],[U_NIT],[U_Serie],[U_TipoDocumento],[U_UUID]) VALUES ('`+respuesta.seriedocumento+`-`+respuesta.numerodocumento+`','`+respuesta.numerodocumento+`','`+respuesta.docnum+`','`+respuesta.nit+`','`+respuesta.seriedocumento+`','`+respuesta.TipoDocumento+`','`+respuesta.uuid+`')`
            var pool = new sql.ConnectionPool(configSQL)
            pool.connect().then(_ => {
                return pool.request().query(queryIString)
            }).then(result => {
                console.log(" - - - paso 6 - - - ")
                console.log("to_table_fel_continue fin 1")
                console.log("to_table_fel_continue fin 1")
                console.log("to_table_fel_continue fin 1")
                console.log("to_table_fel_continue fin 1")
            });
        });
    }
}

var generar_decimales = function(valorNumerico) {
    var digitos_fraccionarios = valorNumerico.toString().split(".")[1]
    if(digitos_fraccionarios && digitos_fraccionarios.length > 6 ) {
        digitos_fraccionarios = digitos_fraccionarios.substr(0,6)
        valorNumerico = valorNumerico.toString().split(".")[0]+"."+digitos_fraccionarios
    }
    return valorNumerico
}

var to_table_fel = function (jsonDTEVariables) {
    doc_TotalMontoImpuesto = 0
    doc_GranTotal = 0
    doc_items_GranTotal = 0
    doc_items_TotalMontoImpuesto = 0
    xml_factura_complemento = ""
    retencionesFacturaespecial = ""
    xml_factura = ""
    DocNum = jsonDTEVariables.DocNum
    TipoDocumento = jsonDTEVariables.TipoDocumento
    console.log("====================  "+jsonDTEVariables.IDRecepor+" / "+TipoDocumento+"  ====================")
    if(TipoDocumento == "FC") { // factura cambiaria
        //var CodigoMoneda="GTQ"
        var CodigoMoneda=jsonDTEVariables.DocCur
        var Tipo="FCAM"
        var AfiliacionIVA="GEN"
        var CodigoEstablecimiento="1"
        var CorreoEmisor="notificaciones@slc.com.gt"
        var NITEmisor="81578814"
        var NombreComercial="SISTEMAS LOGÍSTICOS Y CORPORATIVOS SOCIEDAD ANÓNIMA"
        var NombreEmisor="SISTEMAS LOGÍSTICOS Y CORPORATIVOS SOCIEDAD ANÓNIMA"
        var Direccion="20 calle 15-00 zona 13"
        var CodigoPostal="1004"
        var Municipio="GUATEMALA"
        var Departamento="GUATEMALA"
        var Pais="GT"
        var Fecha_Emision=jsonDTEVariables.FechaEmision
        var FechaHoraVencimiento=jsonDTEVariables.FechaVencimiento
        var HoraEmision = jsonDTEVariables.HoraEmision
        if(HoraEmision.length == 3) {
            HoraEmision = "0"+HoraEmision
        } 
        HoraEmision = HoraEmision[0]+HoraEmision[1]+":"+HoraEmision[2]+HoraEmision[3]+":00" // +":00.000-06:00"
        var FechaHoraEmision = Fecha_Emision+"T"+HoraEmision+"-06:00"
        var CorreoReceptor = jsonDTEVariables.CorreoReceptor
        if(CorreoReceptor == "" || CorreoReceptor == null) CorreoReceptor = "notificaciones@slc.com.gt"
        var IDRecepor = jsonDTEVariables.IDRecepor
        IDRecepor = IDRecepor.replace(/-/g,"")
        var NombreReceptor = jsonDTEVariables.NombreReceptor
        var NombreCorto = "IVA"
        var emptyval = "NA"
        var adendaitems = ""
        xml_factura = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
        <dte:GTDocumento xmlns:dte="http://www.sat.gob.gt/dte/fel/0.2.0" xmlns:xd="http://www.w3.org/2000/09/xmldsig#" Version="0.1">
            <dte:SAT ClaseDocumento="dte">
                <dte:DTE ID="DatosCertificados">
                    <dte:DatosEmision ID="DatosEmision">
                        <dte:DatosGenerales CodigoMoneda="`+CodigoMoneda+`" FechaHoraEmision="`+FechaHoraEmision+`" Tipo="`+Tipo+`"/>
                        <dte:Emisor AfiliacionIVA="`+AfiliacionIVA+`" CodigoEstablecimiento="`+CodigoEstablecimiento+`" CorreoEmisor="`+CorreoEmisor+`" NITEmisor="`+NITEmisor+`" NombreComercial="`+NombreComercial+`" NombreEmisor="`+NombreEmisor+`">
                            <dte:DireccionEmisor>
                                <dte:Direccion>`+Direccion+`</dte:Direccion>
                                <dte:CodigoPostal>`+CodigoPostal+`</dte:CodigoPostal>
                                <dte:Municipio>`+Municipio+`</dte:Municipio>
                                <dte:Departamento>`+Departamento+`</dte:Departamento>
                                <dte:Pais>`+Pais+`</dte:Pais>
                            </dte:DireccionEmisor>
                        </dte:Emisor>
                        <dte:Receptor CorreoReceptor="`+CorreoReceptor+`" IDReceptor="`+IDRecepor+`" NombreReceptor="`+NombreReceptor+`">
                            <dte:DireccionReceptor>
                                <dte:Direccion>`+jsonDTEVariables.DireccionReceptor+`</dte:Direccion>
                                <dte:CodigoPostal>01013</dte:CodigoPostal>
                                <dte:Municipio>`+jsonDTEVariables.MunicipioReceptor+`</dte:Municipio>
                                <dte:Departamento>`+jsonDTEVariables.DepartamentoReceptor+`</dte:Departamento>
                                <dte:Pais>GT</dte:Pais>
                            </dte:DireccionReceptor>
                        </dte:Receptor>
                        <dte:Frases>
                            <dte:Frase CodigoEscenario="1" TipoFrase="1" />
                        </dte:Frases>
                        <dte:Items>`
        var arreglo_items = jsonDTEVariables.grupo_items
        for(var itms=0; itms < arreglo_items.length; itms++) {
            xml_factura += `
                            <dte:Item BienOServicio="`+arreglo_items[itms]['BienOServicio']+`" NumeroLinea="`+(itms+1)+`">
                                <dte:Cantidad>`+arreglo_items[itms]['iCantidad']+`</dte:Cantidad>
                                <dte:UnidadMedida>`+arreglo_items[itms]['UnidadMedida']+`</dte:UnidadMedida>
                                <dte:Descripcion>`+(' '+arreglo_items[itms]['Descripcion']+`. `+arreglo_items[itms]['ComentarioItem']).replace(/&/g,"&amp;")+`</dte:Descripcion>
                                <dte:PrecioUnitario>`+generar_decimales(arreglo_items[itms]['PrecioUnitario'])+`</dte:PrecioUnitario>
                                <dte:Precio>`+generar_decimales(arreglo_items[itms]['Precio'])+`</dte:Precio>
                                <dte:Descuento>`+generar_decimales(arreglo_items[itms]['Decuento'])+`</dte:Descuento>
                                    <dte:Impuestos>
                                        <dte:Impuesto>
                                        <dte:NombreCorto>`+arreglo_items[itms]['NombreCorto']+`</dte:NombreCorto>
                                        <dte:CodigoUnidadGravable>`+arreglo_items[itms]['CodigoUnidadGravable']+`</dte:CodigoUnidadGravable>
                                        <dte:MontoGravable>`+generar_decimales(arreglo_items[itms]['MontoGravable'])+`</dte:MontoGravable>
                                        <dte:MontoImpuesto>`+generar_decimales(arreglo_items[itms]['MontoImpuesto'])+`</dte:MontoImpuesto>
                                    </dte:Impuesto>
                                </dte:Impuestos>
                                <dte:Total>`+generar_decimales(arreglo_items[itms]['iTotal'])+`</dte:Total>
                            </dte:Item>`

            adendaitems += `
                    <dte:AdendaItem LineaReferencia="`+(itms+1)+`">
                       <dte:Valor1>`+arreglo_items[itms]['codigoServicio']+`</dte:Valor1>
                    </dte:AdendaItem>`
        }
        xml_factura += `
                        </dte:Items>
                        <dte:Totales>
                            <dte:TotalImpuestos>
                                <dte:TotalImpuesto NombreCorto="`+NombreCorto+`" TotalMontoImpuesto="`+generar_decimales(jsonDTEVariables.TotalMontoImpuesto)+`"/>
                            </dte:TotalImpuestos>
                            <dte:GranTotal>`+generar_decimales(jsonDTEVariables.GranTotal)+`</dte:GranTotal>
                        </dte:Totales>
                        <dte:Complementos>
                           <dte:Complemento IDComplemento="AbonosFacturaCambiaria" NombreComplemento="AbonosFacturaCambiaria" URIComplemento="http://www.sat.gob.gt/dte/fel/CompCambiaria/0.1.0">
                              <cfc:AbonosFacturaCambiaria xmlns:cfc="http://www.sat.gob.gt/dte/fel/CompCambiaria/0.1.0" Version="1">
                                 <cfc:Abono>
                                    <cfc:NumeroAbono>`+jsonDTEVariables.NumeroDeAbono+`</cfc:NumeroAbono>
                                    <cfc:FechaVencimiento>`+FechaHoraVencimiento+`</cfc:FechaVencimiento>
                                    <cfc:MontoAbono>`+generar_decimales(jsonDTEVariables.MontoDeAbono)+`</cfc:MontoAbono>
                                 </cfc:Abono>
                              </cfc:AbonosFacturaCambiaria>
                           </dte:Complemento>
                        </dte:Complementos>
                    </dte:DatosEmision>
                </dte:DTE>

                <dte:Adenda>
                    <dte:AdendaDetail ID="AdendaSummary">
                        <dte:AdendaSummary>
                            <dte:Valor1>`+jsonDTEVariables.ComentarioDoc+`</dte:Valor1>
                        </dte:AdendaSummary>
                        <dte:AdendaDetails/>
                        <dte:AdendaItems>`+adendaitems+`</dte:AdendaItems>
                    </dte:AdendaDetail>
                    <TemplateInfo detailTemplateId="`+jsonDTEVariables.IdPlantilla+`" templateId="`+jsonDTEVariables.IdPlantilla+`"/>
                </dte:Adenda>
            </dte:SAT>
        </dte:GTDocumento>`
        xml_factura = xml_factura
            .replace(/\r?\n|\r/g, "")
            .replace(/\t/g, "")
            .replace(/\s\s+/g,' ')
            .replace(/\s<\?/g,'<?')
        var ruta="registrarDocumentoXML"
        //console.log("xml_factura",xml_factura)
        firmar_documento(xml_factura, ruta)
    }

    if(TipoDocumento == "FCE2") { // factura especial
        var CodigoMoneda="GTQ"
        var Tipo="FESP"
        var AfiliacionIVA="GEN"
        var CodigoEstablecimiento="1"
        var CorreoEmisor="notificaciones@slc.com.gt"
        var NITEmisor="81578814"
        var NombreComercial="SISTEMAS LOGÍSTICOS Y CORPORATIVOS SOCIEDAD ANÓNIMA"
        var NombreEmisor="SISTEMAS LOGÍSTICOS Y CORPORATIVOS SOCIEDAD ANÓNIMA"
        var Direccion="20 calle 15-00 zona 13"
        var CodigoPostal="01013"
        var Municipio="GUATEMALA"
        var Departamento="GUATEMALA"
        var Pais="GT"
        var FechaEmision = jsonDTEVariables.FechaEmision.split("T")[0]
        var HoraEmision = jsonDTEVariables.HoraEmision
        if(HoraEmision.length == 3) {
            HoraEmision = "0"+HoraEmision
        } 
        HoraEmision = HoraEmision[0]+HoraEmision[1]+":"+HoraEmision[2]+HoraEmision[3]+":00" // +":00.000-06:00"
        var FechaHoraEmision=FechaEmision+"T"+HoraEmision
        var CorreoReceptor = jsonDTEVariables.CorreoReceptor
        if(CorreoReceptor == "") CorreoReceptor = "notificaciones@slc.com.gt"
        var IDRecepor = jsonDTEVariables.IDRecepor
        IDRecepor = IDRecepor.replace(/-/g,"")
        var NombreReceptor = jsonDTEVariables.NombreReceptor
        var NombreCorto = "IVA"
        var emptyval = "NA"
        var adendaitems = ""
        xml_factura = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
        <dte:GTDocumento xmlns:dte="http://www.sat.gob.gt/dte/fel/0.2.0" xmlns:xd="http://www.w3.org/2000/09/xmldsig#" Version="0.1">
            <dte:SAT ClaseDocumento="dte">
                <dte:DTE ID="DatosCertificados">
                    <dte:DatosEmision ID="DatosEmision">
                        <dte:DatosGenerales CodigoMoneda="`+CodigoMoneda+`" FechaHoraEmision="`+FechaHoraEmision+`" Tipo="`+Tipo+`"/>
                        <dte:Emisor AfiliacionIVA="`+AfiliacionIVA+`" CodigoEstablecimiento="`+CodigoEstablecimiento+`" CorreoEmisor="`+CorreoEmisor+`" NITEmisor="`+NITEmisor+`" NombreComercial="`+NombreComercial+`" NombreEmisor="`+NombreEmisor+`">
                            <dte:DireccionEmisor>
                                <dte:Direccion>`+Direccion+`</dte:Direccion>
                                <dte:CodigoPostal>`+CodigoPostal+`</dte:CodigoPostal>
                                <dte:Municipio>`+Municipio+`</dte:Municipio>
                                <dte:Departamento>`+Departamento+`</dte:Departamento>
                                <dte:Pais>`+Pais+`</dte:Pais>
                            </dte:DireccionEmisor>
                        </dte:Emisor>
                        <dte:Receptor CorreoReceptor="`+CorreoReceptor+`" IDReceptor="`+IDRecepor+`" NombreReceptor="`+NombreReceptor+`"  >
                            <dte:DireccionReceptor>
                                <dte:Direccion>`+jsonDTEVariables.DireccionReceptorEspecial+`</dte:Direccion>
                                <dte:CodigoPostal>01013</dte:CodigoPostal>
                                <dte:Municipio>`+jsonDTEVariables.MunicipioReceptor+`</dte:Municipio>
                                <dte:Departamento>`+jsonDTEVariables.DepartamentoReceptor+`</dte:Departamento>
                                <dte:Pais>GT</dte:Pais>
                            </dte:DireccionReceptor>
                        </dte:Receptor>
                        <dte:Items>`
        var arreglo_items = jsonDTEVariables.grupo_items
        for(var itms=0; itms < arreglo_items.length; itms++) {
            xml_factura += `
                            <dte:Item BienOServicio="`+arreglo_items[itms]['BienOServicio']+`" NumeroLinea="`+(itms+1)+`">
                                <dte:Cantidad>`+arreglo_items[itms]['iCantidad']+`</dte:Cantidad>
                                <dte:UnidadMedida>`+arreglo_items[itms]['UnidadMedida']+`</dte:UnidadMedida>
                                <dte:Descripcion>`+arreglo_items[itms]['Descripcion']+`. `+arreglo_items[itms]['ComentarioItem']+`</dte:Descripcion>
                                <dte:PrecioUnitario>`+generar_decimales(arreglo_items[itms]['PrecioUnitario'])+`</dte:PrecioUnitario>
                                <dte:Precio>`+generar_decimales(arreglo_items[itms]['Precio'])+`</dte:Precio>
                                <dte:Descuento>`+generar_decimales(arreglo_items[itms]['Decuento'])+`</dte:Descuento>
                                <dte:Impuestos>
                                    <dte:Impuesto>
                                        <dte:NombreCorto>`+arreglo_items[itms]['NombreCorto']+`</dte:NombreCorto>
                                        <dte:CodigoUnidadGravable>`+arreglo_items[itms]['CodigoUnidadGravable']+`</dte:CodigoUnidadGravable>
                                        <dte:MontoGravable>`+generar_decimales(arreglo_items[itms]['MontoGravable'])+`</dte:MontoGravable>
                                        <dte:MontoImpuesto>`+generar_decimales(arreglo_items[itms]['MontoImpuesto'])+`</dte:MontoImpuesto>
                                    </dte:Impuesto>
                                </dte:Impuestos>
                                <dte:Total>`+generar_decimales(arreglo_items[itms]['iTotal'])+`</dte:Total>
                            </dte:Item>`
        }

        xml_factura += `
                        </dte:Items>
                        <dte:Totales>
                            <dte:TotalImpuestos>
                                <dte:TotalImpuesto NombreCorto="`+NombreCorto+`" TotalMontoImpuesto="`+generar_decimales(jsonDTEVariables.TotalMontoImpuesto)+`"/>
                            </dte:TotalImpuestos>
                        <dte:GranTotal>`+( parseFloat(jsonDTEVariables.GranTotal) + parseFloat(jsonDTEVariables.RetencionISR) + parseFloat(jsonDTEVariables.RetencionIVA) )+`</dte:GranTotal>
                        </dte:Totales>
                        <dte:Complementos>
                           <dte:Complemento NombreComplemento="ncomp" URIComplemento="http://www.sat.gob.gt/face2/ComplementoFacturaEspecial/0.1.0">
                                <cfe:RetencionesFacturaEspecial xmlns:cfe="http://www.sat.gob.gt/face2/ComplementoFacturaEspecial/0.1.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" Version="1">
                                    <cfe:RetencionISR>`+jsonDTEVariables.RetencionISR+`</cfe:RetencionISR>
                                    <cfe:RetencionIVA>`+jsonDTEVariables.RetencionIVA+`</cfe:RetencionIVA>
                                    <cfe:TotalMenosRetenciones>`+ jsonDTEVariables.GranTotal +`</cfe:TotalMenosRetenciones>
                                </cfe:RetencionesFacturaEspecial>
                           </dte:Complemento>
                        </dte:Complementos>
                    </dte:DatosEmision>
                </dte:DTE>
            </dte:SAT>
        </dte:GTDocumento>`

        xml_factura = xml_factura
            .replace(/\r?\n|\r/g, "")
            .replace(/\t/g, "")
            .replace(/\s\s+/g,' ')
            .replace(/\s<\?/g,'<?')
        var ruta="registrarDocumentoXML"
        firmar_documento(xml_factura,ruta)
    }

    if(TipoDocumento == "NC") { // nota de credito
        //var CodigoMoneda="GTQ"
        var CodigoMoneda=jsonDTEVariables.DocCur
        var Tipo="NCRE"
        var AfiliacionIVA="GEN"
        var CodigoEstablecimiento="1"
        var CorreoEmisor="notificaciones@slc.com.gt"
        var NITEmisor="81578814"
        var NombreComercial="SISTEMAS LOGÍSTICOS Y CORPORATIVOS SOCIEDAD ANÓNIMA"
        var NombreEmisor="SISTEMAS LOGÍSTICOS Y CORPORATIVOS SOCIEDAD ANÓNIMA"
        var Direccion="20 calle 15-00 zona 13"
        var CodigoPostal="01013"
        var Municipio="GUATEMALA"
        var Departamento="GUATEMALA"
        var Pais="GT"
        var Fecha_Emision=jsonDTEVariables.FechaEmision
        var FechaHoraVencimiento=jsonDTEVariables.FechaVencimiento
        var HoraEmision = jsonDTEVariables.HoraEmision
        if(HoraEmision.length == 3) {
            HoraEmision = "0"+HoraEmision
        } 
        HoraEmision = HoraEmision[0]+HoraEmision[1]+":"+HoraEmision[2]+HoraEmision[3]+":00" // +":00.000-06:00"
        var FechaHoraEmision = Fecha_Emision+"T"+HoraEmision+"-06:00"
        var Fecha_base = jsonDTEVariables.FechaBase
        var Hora_base = jsonDTEVariables.HoraBase
        if(Hora_base.length == 3) {
            Hora_base = "0"+Hora_base
        } 
        Hora_base = Hora_base[0]+Hora_base[1]+":"+Hora_base[2]+Hora_base[3]+":00" // +":00.000-06:00"
        var FechaHorabase = Fecha_base // +"T"+Hora_base+"-06:00"
        var CorreoReceptor = jsonDTEVariables.CorreoReceptor
        if(CorreoReceptor == "" || CorreoReceptor == null) CorreoReceptor = "notificaciones@slc.com.gt"
        var IDRecepor = jsonDTEVariables.IDRecepor
        IDRecepor = IDRecepor.replace(/-/g,"")
        var NombreReceptor = jsonDTEVariables.NombreReceptor
        var NombreCorto = "IVA"
        var emptyval = "NA"
        var adendaitems = ""
        xml_factura = `<?xml version="1.0" encoding="UTF-8"?>
        <dte:GTDocumento xmlns:dte="http://www.sat.gob.gt/dte/fel/0.2.0" Version="0.1">
            <dte:SAT ClaseDocumento="dte">
                <dte:DTE ID="DatosCertificados">
                    <dte:DatosEmision ID="DatosEmision">
                        <dte:DatosGenerales CodigoMoneda="`+CodigoMoneda+`" FechaHoraEmision="`+FechaHoraEmision+`" Tipo="`+Tipo+`"/>
                        <dte:Emisor AfiliacionIVA="`+AfiliacionIVA+`" CodigoEstablecimiento="`+CodigoEstablecimiento+`" CorreoEmisor="`+CorreoEmisor+`" NITEmisor="`+NITEmisor+`" NombreComercial="`+NombreComercial+`" NombreEmisor="`+NombreEmisor+`">
                            <dte:DireccionEmisor>
                                <dte:Direccion>`+Direccion+`</dte:Direccion>
                                <dte:CodigoPostal>`+CodigoPostal+`</dte:CodigoPostal>
                                <dte:Municipio>`+Municipio+`</dte:Municipio>
                                <dte:Departamento>`+Departamento+`</dte:Departamento>
                                <dte:Pais>`+Pais+`</dte:Pais>
                            </dte:DireccionEmisor>
                        </dte:Emisor>
                        <dte:Receptor CorreoReceptor="`+CorreoReceptor+`" IDReceptor="`+IDRecepor+`" NombreReceptor="`+NombreReceptor+`">
                            <dte:DireccionReceptor>
                                <dte:Direccion>`+jsonDTEVariables.DireccionReceptor+`</dte:Direccion>
                                <dte:CodigoPostal>01013</dte:CodigoPostal>
                                <dte:Municipio>`+jsonDTEVariables.MunicipioReceptor+`</dte:Municipio>
                                <dte:Departamento>`+jsonDTEVariables.DepartamentoReceptor+`</dte:Departamento>
                                <dte:Pais>GT</dte:Pais>
                            </dte:DireccionReceptor>
                        </dte:Receptor>
                        <dte:Frases>
                            <dte:Frase TipoFrase="1" CodigoEscenario="1"/>
                        </dte:Frases>
                        <dte:Items>`
        var arreglo_items = jsonDTEVariables.grupo_items
        for(var itms=0; itms < arreglo_items.length; itms++) {
            xml_factura += `
                            <dte:Item BienOServicio="`+arreglo_items[itms]['BienOServicio']+`" NumeroLinea="`+(itms+1)+`">
                                <dte:Cantidad>`+arreglo_items[itms]['iCantidad']+`</dte:Cantidad>
                                <dte:UnidadMedida>`+arreglo_items[itms]['UnidadMedida']+`</dte:UnidadMedida>
                                <dte:Descripcion>`+arreglo_items[itms]['Descripcion']+`. `+arreglo_items[itms]['ComentarioItem']+`</dte:Descripcion>
                                <dte:PrecioUnitario>`+generar_decimales(arreglo_items[itms]['PrecioUnitario'])+`</dte:PrecioUnitario>
                                <dte:Precio>`+generar_decimales(arreglo_items[itms]['Precio'])+`</dte:Precio>
                                <dte:Descuento>`+generar_decimales(arreglo_items[itms]['Decuento'])+`</dte:Descuento>
                                <dte:Impuestos>
                                    <dte:Impuesto>
                                        <dte:NombreCorto>`+arreglo_items[itms]['NombreCorto']+`</dte:NombreCorto>
                                        <dte:CodigoUnidadGravable>`+arreglo_items[itms]['CodigoUnidadGravable']+`</dte:CodigoUnidadGravable>
                                        <dte:MontoGravable>`+generar_decimales(arreglo_items[itms]['MontoGravable'])+`</dte:MontoGravable>
                                        <dte:MontoImpuesto>`+generar_decimales(arreglo_items[itms]['MontoImpuesto'])+`</dte:MontoImpuesto>
                                    </dte:Impuesto>
                                </dte:Impuestos>
                                <dte:Total>`+generar_decimales(arreglo_items[itms]['iTotal'])+`</dte:Total>
                            </dte:Item>`
        }

        xml_factura += `
                        </dte:Items>
                        <dte:Totales>
                            <dte:TotalImpuestos>
                                <dte:TotalImpuesto NombreCorto="`+NombreCorto+`" TotalMontoImpuesto="`+generar_decimales(jsonDTEVariables.TotalMontoImpuesto)+`"/>
                            </dte:TotalImpuestos>
                            <dte:GranTotal>`+generar_decimales(jsonDTEVariables.GranTotal)+`</dte:GranTotal>
                        </dte:Totales>
                        <dte:Complementos>
                           <dte:Complemento IDComplemento="ComplementoReferenciaNota" NombreComplemento="Complemento Referencia Nota" URIComplemento="http://www.sat.gob.gt/face2/ComplementoReferenciaNota/0.1.0">
                            <cno:ReferenciasNota xmlns:cno="http://www.sat.gob.gt/face2/ComplementoReferenciaNota/0.1.0" 
                                FechaEmisionDocumentoOrigen="`+FechaHorabase+`" 
                                MotivoAjuste="`+jsonDTEVariables.ComentarioDoc+`"
                                NumeroAutorizacionDocumentoOrigen="`+jsonDTEVariables.UUIdBase+`" 
                                SerieDocumentoOrigen="`+jsonDTEVariables.SerieBase+`" 
                                NumeroDocumentoOrigen="`+jsonDTEVariables.NumeroBase+`" 
                                Version="0.1"/>
                           </dte:Complemento>
                        </dte:Complementos>
                    </dte:DatosEmision>
                </dte:DTE>
                <dte:Adenda>
                    <dte:AdendaDetail ID="AdendaSummary">
                        <dte:AdendaSummary>
                            <dte:Valor1>`+jsonDTEVariables.ComentarioDoc+`</dte:Valor1>
                        </dte:AdendaSummary>
                        <dte:AdendaDetails/>
                        <dte:AdendaItems>`+adendaitems+`</dte:AdendaItems>
                    </dte:AdendaDetail>
                    <TemplateInfo detailTemplateId="`+jsonDTEVariables.IdPlantilla+`" templateId="`+jsonDTEVariables.IdPlantilla+`"/>
                </dte:Adenda>
            </dte:SAT>
        </dte:GTDocumento>`
        xml_factura = xml_factura
            .replace(/\r?\n|\r/g, "")
            .replace(/\t/g, "")
            .replace(/\s\s+/g,' ')
            .replace(/\s<\?/g,'<?')

        var ruta="registrarDocumentoXML"
        //console.log("xml_factura",xml_factura)
        firmar_documento(xml_factura,ruta)
    }

    if(TipoDocumento == "NAB") { // nota de abono
        var CodigoMoneda="GTQ"
        var Tipo="NABN"
        var AfiliacionIVA="GEN"
        var CodigoEstablecimiento="1"
        var CorreoEmisor="notificaciones@slc.com.gt"
        var NITEmisor="81578814"
        var NombreComercial="SISTEMAS LOGÍSTICOS Y CORPORATIVOS SOCIEDAD ANÓNIMA"
        var NombreEmisor="SISTEMAS LOGÍSTICOS Y CORPORATIVOS SOCIEDAD ANÓNIMA"
        var Direccion="20 calle 15-00 zona 13"
        var CodigoPostal="01013"
        var Municipio="GUATEMALA"
        var Departamento="GUATEMALA"
        var Pais="GT"
        var FechaEmision = jsonDTEVariables.FechaEmision.split("T")[0]
        var HoraEmision = jsonDTEVariables.HoraEmision
        if(HoraEmision.length == 3) {
            HoraEmision = "0"+HoraEmision
        } 
        HoraEmision = HoraEmision[0]+HoraEmision[1]+":"+HoraEmision[2]+HoraEmision[3]+":00" // +":00.000-06:00"
        var FechaHoraEmision=FechaEmision+"T"+HoraEmision
        var CorreoReceptor = jsonDTEVariables.CorreoReceptor
        if(CorreoReceptor == "" || CorreoReceptor == null) CorreoReceptor = "notificaciones@slc.com.gt"
        var IDRecepor = jsonDTEVariables.IDRecepor
        IDRecepor = IDRecepor.replace(/-/g,"")
        var NombreReceptor = jsonDTEVariables.NombreReceptor
        var NombreCorto = "IVA"
        var emptyval = "NA"
        var adendaitems = ""
        xml_factura = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
        <dte:GTDocumento xmlns:dte="http://www.sat.gob.gt/dte/fel/0.2.0" xmlns:xd="http://www.w3.org/2000/09/xmldsig#" Version="0.1">
            <dte:SAT ClaseDocumento="dte">
                <dte:DTE ID="DatosCertificados">
                    <dte:DatosEmision ID="DatosEmision">
                        <dte:DatosGenerales CodigoMoneda="`+CodigoMoneda+`" FechaHoraEmision="`+FechaHoraEmision+`" Tipo="`+Tipo+`"/>
                        <dte:Emisor AfiliacionIVA="`+AfiliacionIVA+`" CodigoEstablecimiento="`+CodigoEstablecimiento+`" CorreoEmisor="`+CorreoEmisor+`" NITEmisor="`+NITEmisor+`" NombreComercial="`+NombreComercial+`" NombreEmisor="`+NombreEmisor+`">
                            <dte:DireccionEmisor>
                                <dte:Direccion>`+Direccion+`</dte:Direccion>
                                <dte:CodigoPostal>`+CodigoPostal+`</dte:CodigoPostal>
                                <dte:Municipio>`+Municipio+`</dte:Municipio>
                                <dte:Departamento>`+Departamento+`</dte:Departamento>
                                <dte:Pais>`+Pais+`</dte:Pais>
                            </dte:DireccionEmisor>
                        </dte:Emisor>
                        <dte:Receptor CorreoReceptor="`+CorreoReceptor+`" IDReceptor="`+IDRecepor+`" NombreReceptor="`+NombreReceptor+`">
                            <dte:DireccionReceptor>
                                <dte:Direccion>`+jsonDTEVariables.DireccionReceptor+`</dte:Direccion>
                                <dte:CodigoPostal>01013</dte:CodigoPostal>
                                <dte:Municipio>`+jsonDTEVariables.MunicipioReceptor+`</dte:Municipio>
                                <dte:Departamento>`+jsonDTEVariables.DepartamentoReceptor+`</dte:Departamento>
                                <dte:Pais>GT</dte:Pais>
                            </dte:DireccionReceptor>
                        </dte:Receptor>
                        <dte:Items>`
        var arreglo_items = jsonDTEVariables.grupo_items
        for(var itms=0; itms < arreglo_items.length; itms++) {
            xml_factura += `
                            <dte:Item BienOServicio="`+arreglo_items[itms]['BienOServicio']+`" NumeroLinea="`+(itms+1)+`">
                                <dte:Cantidad>`+arreglo_items[itms]['iCantidad']+`</dte:Cantidad>
                                <dte:UnidadMedida>`+arreglo_items[itms]['UnidadMedida']+`</dte:UnidadMedida>
                                <dte:Descripcion>`+arreglo_items[itms]['Descripcion']+`. `+arreglo_items[itms]['ComentarioItem']+`</dte:Descripcion>
                                <dte:PrecioUnitario>`+generar_decimales(arreglo_items[itms]['PrecioUnitario'])+`</dte:PrecioUnitario>
                                <dte:Precio>`+generar_decimales(arreglo_items[itms]['Precio'])+`</dte:Precio>
                                <dte:Descuento>`+generar_decimales(arreglo_items[itms]['Decuento'])+`</dte:Descuento>
                                <dte:Total>`+generar_decimales(arreglo_items[itms]['iTotal'])+`</dte:Total>
                            </dte:Item>`
        }

        xml_factura += `
                        </dte:Items>
                        <dte:Totales>
                            <dte:GranTotal>`+generar_decimales(jsonDTEVariables.GranTotal)+`</dte:GranTotal>
                        </dte:Totales>
                    </dte:DatosEmision>
                </dte:DTE>
                <dte:Adenda>
                    <dte:AdendaDetail ID="AdendaSummary">
                        <dte:AdendaSummary>
                            <dte:Valor1>`+jsonDTEVariables.ComentarioDoc+`</dte:Valor1>
                        </dte:AdendaSummary>
                        <dte:AdendaDetails/>
                        <dte:AdendaItems>`+adendaitems+`</dte:AdendaItems>
                    </dte:AdendaDetail>
                    <TemplateInfo detailTemplateId="`+jsonDTEVariables.IdPlantilla+`" templateId="`+jsonDTEVariables.IdPlantilla+`"/>
                </dte:Adenda>
            </dte:SAT>
        </dte:GTDocumento>`

        xml_factura = xml_factura
            .replace(/\r?\n|\r/g, "")
            .replace(/\t/g, "")
            .replace(/\s\s+/g,' ')
            .replace(/\s<\?/g,'<?')

        var ruta="registrarDocumentoXML"
        firmar_documento(xml_factura,ruta)
    }

    if(TipoDocumento == "ANAB") { // anulacion nota de abono
        var NumeroDocumentoAAnular = ""
        var NITEmisor = ""
        var IDReceptor = ""
        var FechaEmisionDocumentoAnular = ""
        var FechaHoraAnulacion = ""
        var MotivoAnulacion = ""
        var FechaEmision = jsonDTEVariables.FechaBase //.split("T")[0] adrian
        var HoraEmision = jsonDTEVariables.HoraBase
        if(HoraEmision.length == 3) {
            HoraEmision = "0"+HoraEmision
        } 
        HoraEmision = HoraEmision[0]+HoraEmision[1]+":"+HoraEmision[2]+HoraEmision[3]+":00" // +":00.000-06:00"
        var FechaHoraEmision=FechaEmision+"T"+HoraEmision+"-06:00"
        var IDRecepor = jsonDTEVariables.IDRecepor
        IDRecepor = IDRecepor.replace(/-/g,"")
        var fecha_anulacion = new Date()
        xml_factura = `<?xml version="1.0" encoding="UTF-8"?>
            <ns:GTAnulacionDocumento xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:ns="http://www.sat.gob.gt/dte/fel/0.1.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" Version="0.1">
                <ns:SAT>
                    <ns:AnulacionDTE ID="DatosCertificados">
                        <ns:DatosGenerales ID="DatosAnulacion"
                          NumeroDocumentoAAnular="`+jsonDTEVariables.UUIdBase+`"
                          IDReceptor="`+IDRecepor+`"
                          NITEmisor="81578814"
                          FechaEmisionDocumentoAnular="`+FechaHoraEmision+`"
                          FechaHoraAnulacion="`+ jsonDTEVariables.FechaEmision +`T00:00:00-06:00"
                          MotivoAnulacion="CANCELACION" />
                    </ns:AnulacionDTE>
                </ns:SAT>
            </ns:GTAnulacionDocumento>`
        xml_factura = xml_factura
            .replace(/\r?\n|\r/g, "")
            .replace(/\t/g, "")
            .replace(/\s\s+/g,' ')
            .replace(/\s<\?/g,'<?')

        var ruta="anularDocumentoXML"
        firmar_documento(xml_factura,ruta)
    }

    if(TipoDocumento == "NCA2") { // nota credito documento antiguo
        var CodigoMoneda="GTQ"
        var Tipo="NCRE"
        var AfiliacionIVA="GEN"
        var CodigoEstablecimiento="1"
        var CorreoEmisor="notificaciones@slc.com.gt"
        var NITEmisor="81578814"
        var NombreComercial="SISTEMAS LOGÍSTICOS Y CORPORATIVOS SOCIEDAD ANÓNIMA"
        var NombreEmisor="SISTEMAS LOGÍSTICOS Y CORPORATIVOS SOCIEDAD ANÓNIMA"
        var Direccion="20 calle 15-00 zona 13"
        var CodigoPostal="1004"
        var Municipio="GUATEMALA"
        var Departamento="GUATEMALA"
        var Pais="GT"
        var FechaEmision = jsonDTEVariables.FechaEmision.split("T")[0]
        var HoraEmision = jsonDTEVariables.HoraEmision
        if(HoraEmision.length == 3) {
            HoraEmision = "0"+HoraEmision
        } 
        HoraEmision = HoraEmision[0]+HoraEmision[1]+":"+HoraEmision[2]+HoraEmision[3]+":00" // +":00.000-06:00"
        var FechaHoraEmision=FechaEmision+"T"+HoraEmision
        var CorreoReceptor = jsonDTEVariables.CorreoReceptor
        if(CorreoReceptor == "") CorreoReceptor = "notificaciones@slc.com.gt"
        var IDRecepor = jsonDTEVariables.IDRecepor
        IDRecepor = IDRecepor.replace(/-/g,"")
        var NombreReceptor = jsonDTEVariables.NombreReceptor
        var NombreCorto = "IVA"
        var emptyval = "NA"
        xml_factura = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
        <dte:GTDocumento xmlns:dte="http://www.sat.gob.gt/dte/fel/0.2.0" xmlns:xd="http://www.w3.org/2000/09/xmldsig#" Version="0.1">
            <dte:SAT ClaseDocumento="dte">
                <dte:DTE ID="DatosCertificados">
                    <dte:DatosEmision ID="DatosEmision">
                        <dte:DatosGenerales CodigoMoneda="`+CodigoMoneda+`" FechaHoraEmision="`+FechaHoraEmision+`" Tipo="`+Tipo+`"/>
                        <dte:Emisor AfiliacionIVA="`+AfiliacionIVA+`" CodigoEstablecimiento="`+CodigoEstablecimiento+`" CorreoEmisor="`+CorreoEmisor+`" NITEmisor="`+NITEmisor+`" NombreComercial="`+NombreComercial+`" NombreEmisor="`+NombreEmisor+`">
                            <dte:DireccionEmisor>
                                <dte:Direccion>`+Direccion+`</dte:Direccion>
                                <dte:CodigoPostal>`+CodigoPostal+`</dte:CodigoPostal>
                                <dte:Municipio>`+Municipio+`</dte:Municipio>
                                <dte:Departamento>`+Departamento+`</dte:Departamento>
                                <dte:Pais>`+Pais+`</dte:Pais>
                            </dte:DireccionEmisor>
                        </dte:Emisor>
                        <dte:Receptor CorreoReceptor="`+CorreoReceptor+`" IDReceptor="`+IDRecepor+`" NombreReceptor="`+NombreReceptor+`">
                            <dte:DireccionReceptor>
                                <dte:Direccion>`+jsonDTEVariables.DireccionReceptor+`</dte:Direccion>
                                <dte:CodigoPostal>01010</dte:CodigoPostal>
                                <dte:Municipio>Mixco</dte:Municipio>
                                <dte:Departamento>Guatemala</dte:Departamento>
                                <dte:Pais>GT</dte:Pais>
                            </dte:DireccionReceptor>
                        </dte:Receptor>
                        <dte:Items>`
        var arreglo_items = jsonDTEVariables.grupo_items
        for(var itms=0; itms < arreglo_items.length; itms++) {
            xml_factura += `
                            <dte:Item BienOServicio="`+arreglo_items[itms]['BienOServicio']+`" NumeroLinea="`+(itms+1)+`">
                                <dte:Cantidad>`+arreglo_items[itms]['iCantidad']+`</dte:Cantidad>
                                <dte:UnidadMedida>`+arreglo_items[itms]['UnidadMedida']+`</dte:UnidadMedida>
                                <dte:Descripcion>`+arreglo_items[itms]['Descripcion']+`. `+arreglo_items[itms]['ComentarioItem']+`</dte:Descripcion>
                                <dte:PrecioUnitario>`+generar_decimales(arreglo_items[itms]['PrecioUnitario'])+`</dte:PrecioUnitario>
                                <dte:Precio>`+generar_decimales(arreglo_items[itms]['Precio'])+`</dte:Precio>
                                <dte:Descuento>`+generar_decimales(arreglo_items[itms]['Decuento'])+`</dte:Descuento>
                                    <dte:Impuestos>
                                        <dte:Impuesto>
                                        <dte:NombreCorto>`+arreglo_items[itms]['NombreCorto']+`</dte:NombreCorto>
                                        <dte:CodigoUnidadGravable>`+arreglo_items[itms]['CodigoUnidadGravable']+`</dte:CodigoUnidadGravable>
                                        <dte:MontoGravable>`+generar_decimales(arreglo_items[itms]['MontoGravable'])+`</dte:MontoGravable>
                                        <dte:MontoImpuesto>`+generar_decimales(arreglo_items[itms]['MontoImpuesto'])+`</dte:MontoImpuesto>
                                    </dte:Impuesto>
                                </dte:Impuestos>
                                <dte:Total>`+generar_decimales(arreglo_items[itms]['iTotal'])+`</dte:Total>
                            </dte:Item>`
        }
        xml_factura += `
                        </dte:Items>
                        <dte:Totales>
                            <dte:TotalImpuestos>
                                <dte:TotalImpuesto NombreCorto="`+NombreCorto+`" TotalMontoImpuesto="`+generar_decimales(jsonDTEVariables.TotalMontoImpuesto)+`"/>
                            </dte:TotalImpuestos>
                            <dte:GranTotal>`+generar_decimales(jsonDTEVariables.GranTotal)+`</dte:GranTotal>
                        </dte:Totales>
                        <dte:Complementos>
                            <dte:Complemento IDComplemento="ComplementoReferenciaNota" NombreComplemento="Complemento Referencia Nota" URIComplemento="http://www.sat.gob.gt/face2/ComplementoReferenciaNota/0.1.0">
                                <cno:ReferenciasNota xmlns:cno="http://www.sat.gob.gt/face2/ComplementoReferenciaNota/0.1.0" 
                                    FechaEmisionDocumentoOrigen="`+jsonDTEVariables.FechaBase.split('T')[0]+`" 
                                    MotivoAjuste="`+jsonDTEVariables.ComentarioDoc+`"
                                    NumeroAutorizacionDocumentoOrigen="`+jsonDTEVariables.ResolucionGFACE+`" 
                                    NumeroDocumentoOrigen="`+jsonDTEVariables.NumeroDocumentoGFACE+`"
                                    RegimenAntiguo="Antiguo"
                                    SerieDocumentoOrigen="`+jsonDTEVariables.SerieDocumentoGFACE+`"
                                    Version="0"/>
                            </dte:Complemento>
                        </dte:Complementos>
                    </dte:DatosEmision>
                </dte:DTE>
            </dte:SAT>
        </dte:GTDocumento>`
        xml_factura = xml_factura
            .replace(/\r?\n|\r/g, "")
            .replace(/\t/g, "")
            .replace(/\s\s+/g,' ')
            .replace(/\s<\?/g,'<?')

        var ruta="registrarDocumentoXML"
        firmar_documento(xml_factura,ruta)
    }

    if(TipoDocumento == "AFC" || TipoDocumento == "ANC") { // anulacion factura cambiaria y anulacion nota de credito
        var NumeroDocumentoAAnular = ""
        var NITEmisor = ""
        var IDReceptor = ""
        var FechaEmisionDocumentoAnular = ""
        var FechaHoraAnulacion = ""
        var MotivoAnulacion = ""
        var IDRecepor = jsonDTEVariables.IDRecepor
        IDRecepor = IDRecepor.replace(/-/g,"")
        //var Fecha_Emision=jsonDTEVariables.FechaEmision
        var Fecha_Emision=jsonDTEVariables.FechaBase //adrian
        var FechaHoraVencimiento=jsonDTEVariables.FechaVencimiento
        var HoraEmision = jsonDTEVariables.HoraBase
        if(HoraEmision.length == 3) {
            HoraEmision = "0"+HoraEmision
        } 
        HoraEmision = HoraEmision[0]+HoraEmision[1]+":"+HoraEmision[2]+HoraEmision[3]+":00" // +":00.000-06:00"
        var FechaHoraEmision = Fecha_Emision+"T"+HoraEmision+"-06:00"
        var fecha_anulacion = new Date()
        UUIdBaseGlobal = jsonDTEVariables.UUIdBase
        xml_factura = `<?xml version="1.0" encoding="UTF-8"?>
            <ns:GTAnulacionDocumento xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:ns="http://www.sat.gob.gt/dte/fel/0.1.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" Version="0.1">
                <ns:SAT>
                    <ns:AnulacionDTE ID="DatosCertificados">
                        <ns:DatosGenerales ID="DatosAnulacion"
                          NumeroDocumentoAAnular="`+jsonDTEVariables.UUIdBase+`"
                          IDReceptor="`+IDRecepor+`"
                          NITEmisor="81578814"
                          FechaEmisionDocumentoAnular="`+FechaHoraEmision+`"
                          FechaHoraAnulacion="`+ jsonDTEVariables.FechaEmision +`T00:00:00-06:00"
                          MotivoAnulacion="CANCELACION" />
                    </ns:AnulacionDTE>
                </ns:SAT>
            </ns:GTAnulacionDocumento>`
        xml_factura = xml_factura
            .replace(/\r?\n|\r/g, "")
            .replace(/\t/g, "")
            .replace(/\s\s+/g,' ')
            .replace(/\s<\?/g,'<?')
        var ruta="anularDocumentoXML"
        firmar_documento(xml_factura,ruta)
        console.log(xml_factura) //adrian 20211201
    }
}

var UUIdBaseGlobal = ""

var firmar_documento =  function(xml_factura, ruta) {
    var cadena = `<?xml version="1.0" encoding="UTF-8"?><FirmaDocumentoRequest id="A3FD2363-05C2-AB7B-373D-56C08C311272"><xml_dte><![CDATA[`+xml_factura+`]]></xml_dte></FirmaDocumentoRequest>`
    console.log('firmar_documento')
    request.post({ 
        "headers": { 
            "content-type": "application/xml" ,
                "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJvcGVuaWQiXSwiZXhwIjoxNjk5NDE0MDE5LCJhdXRob3JpdGllcyI6WyJST0xFX0VNSVNPUiJdLCJqdGkiOiJlMjYwOWNjNS0xYTZmLTQzNzEtOTg4My05NWUzNzg3ZDk1MmIiLCJjbGllbnRfaWQiOiI4MTU3ODgxNCJ9.gVEmBk2gEg92ZQMVIo3uYx9aAY1b-LlPEttc3Dyf3xyFjdincvKV1gOah29KT4EtQDV-P_QvVV3SbC_C4E2yls-sbBZ3cziuOdxyVMEgX6VxVaCAIFn4AkDS2sFujKKRMScSwHLEhu7oZimoTBOIH034SyvV-e_tQyEcaaVJV6grZQF76kcoc-3YUcxzjF-jjH0gtXg4KwqRTJK9pIafdQn0sHdOXN3OJ5IuBMSKw49OGH4dvLgUpE75vQOyxMr7htrx3IO6lUe2sFDTz4hCzKu0FqqNORg0O5OZcXQik0YG1pdKJZsiPnJ5Gyu_2QkzIvn3I4IVLJDTJAlAshZN7g"
                //"Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJvcGVuaWQiXSwiZXhwIjoxNjc1NjUxNjQ3LCJhdXRob3JpdGllcyI6WyJST0xFX0VNSVNPUiJdLCJqdGkiOiI1MWJhODMzMC1kYWFmLTRhOGYtYWQwMS1hODI4NWE3MjMzNjgiLCJjbGllbnRfaWQiOiI4MTU3ODgxNCJ9.G-X8zE5k1PAWSvb31y1RYFyAQMoJxJPHlGj3spO24zndRK5zQFHVGI3grxQHAxfu0NdreDRFJSIS7o2NJO6YsftNygJMOj1NxKbPa5TnPEuEpjUUu8KTrBlDbKYxLhgU7Tblyh8TvsTWQDpWt0VeegrXEc35cJYswFM8jbk2OtoRUCu-ajda-ne-lgBCNCyZnkbScTkllAGHmTgObp6_qfksTOZ_jOhmbu1GEP8CGBf3J7RIdOBRgpPkHyYLBvCvdhz8X_AS55XHx1OaAuHPq3-0pmTi37nN5KP4u-jgjc2k1eEglIXgqiXd0gRqAS9nB5V9agCEBCjToNMGHuBNZQt
        },
        "url": "https://api.soluciones-mega.com/api/solicitaFirma", 
        //"url": "https://dev.api.soluciones-mega.com/api/solicitaFirma", //Para ambiente de Pruebas megaprint
        "body": cadena
    },(error, response, body) => { 
        if(error) { 
            console.log("firmar_documento error", error)
        }
        body = body.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&")
        var si = body.search("<xml_dte>"); 
        var sf = body.search("</xml_dte>"); 
        var bf = body.substring(si+9,sf);
        if(ruta == "registrarDocumentoXML") {
            enviar_a_certificador(bf)
        }
        if(ruta == "anularDocumentoXML") {
            enviar_anulacion_a_certificador(bf)
        }
    })
}

var enviar_anulacion_a_certificador = function(factura_firmada) {
    var doc_id = "000000000000"+DocNum
    if(doc_id.length > 12) {
        doc_id = doc_id.substr((doc_id.length-12),doc_id.length)
    }
    var cadena = `<?xml version='1.0' encoding='UTF-8'?><AnulaDocumentoXMLRequest id="00000000-0000-0000-0000-`+doc_id+`"><xml_dte><![CDATA[`+ factura_firmada +` ]]></xml_dte></AnulaDocumentoXMLRequest>`
    console.log("enviar_anulacion_a_certificador")
    request.post({ 
        "headers": { 
            "content-type": "application/xml" ,
                "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJvcGVuaWQiXSwiZXhwIjoxNjk5NDE0MDE5LCJhdXRob3JpdGllcyI6WyJST0xFX0VNSVNPUiJdLCJqdGkiOiJlMjYwOWNjNS0xYTZmLTQzNzEtOTg4My05NWUzNzg3ZDk1MmIiLCJjbGllbnRfaWQiOiI4MTU3ODgxNCJ9.gVEmBk2gEg92ZQMVIo3uYx9aAY1b-LlPEttc3Dyf3xyFjdincvKV1gOah29KT4EtQDV-P_QvVV3SbC_C4E2yls-sbBZ3cziuOdxyVMEgX6VxVaCAIFn4AkDS2sFujKKRMScSwHLEhu7oZimoTBOIH034SyvV-e_tQyEcaaVJV6grZQF76kcoc-3YUcxzjF-jjH0gtXg4KwqRTJK9pIafdQn0sHdOXN3OJ5IuBMSKw49OGH4dvLgUpE75vQOyxMr7htrx3IO6lUe2sFDTz4hCzKu0FqqNORg0O5OZcXQik0YG1pdKJZsiPnJ5Gyu_2QkzIvn3I4IVLJDTJAlAshZN7g"
                //"Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJvcGVuaWQiXSwiZXhwIjoxNjc1NjUxNjQ3LCJhdXRob3JpdGllcyI6WyJST0xFX0VNSVNPUiJdLCJqdGkiOiI1MWJhODMzMC1kYWFmLTRhOGYtYWQwMS1hODI4NWE3MjMzNjgiLCJjbGllbnRfaWQiOiI4MTU3ODgxNCJ9.G-X8zE5k1PAWSvb31y1RYFyAQMoJxJPHlGj3spO24zndRK5zQFHVGI3grxQHAxfu0NdreDRFJSIS7o2NJO6YsftNygJMOj1NxKbPa5TnPEuEpjUUu8KTrBlDbKYxLhgU7Tblyh8TvsTWQDpWt0VeegrXEc35cJYswFM8jbk2OtoRUCu-ajda-ne-lgBCNCyZnkbScTkllAGHmTgObp6_qfksTOZ_jOhmbu1GEP8CGBf3J7RIdOBRgpPkHyYLBvCvdhz8X_AS55XHx1OaAuHPq3-0pmTi37nN5KP4u-jgjc2k1eEglIXgqiXd0gRqAS9nB5V9agCEBCjToNMGHuBNZQt
        }, 
        "url": "https://apiv2.ifacere-fel.com/api/anularDocumentoXML",
        //"url": "https://dev2.api.ifacere-fel.com/api/anularDocumentoXML",//Para ambiente de pruebas megaprint
        "body": cadena 
    },(error, response, body) => { 
        if(error) { 
            console.log("enviar_anulacion_a_certificador error", error)
        } 
        body = body.replace(/&lt;/g,"<").replace(/&gt;/g,">")
        toJs(body, (err, obj) => {
            if(typeof obj['AnulaDocumentoXMLResponse']['uuid'] === 'undefined') {
                var name_error = " "+Math.random() 
                var queryString_error = `INSERT INTO [SBO_Sistemas_Logisticos].[dbo].[@FELE] ([Code] ,[Name] ,[U_UUID] ,[U_DocNum], [U_TipoDocumento], [U_DescError]) VALUES ('`+name_error+`', '`+name_error+`', '`+U_Name_Error+`', '`+U_DocNum_Error+`', '`+U_Error_TD+`', '`+body+`')`
                var pool = new sql.ConnectionPool(configSQL)
                pool.connect().then(_ => {
                    return pool.request().query(queryString_error)
                }).then(result => {
                    console.log("Error encontrado", U_Name_Error, U_UID_Error, U_DocNum_Error)
                    // return 0
                });
                var htmlContent = `Reporte de error: `+U_Name_Error+' '+U_UID_Error+' '+U_DocNum_Error+'<br><pre>'+body+'</pre>';
                var mailOptions = {
                    from :'sistemas@geo.com.gt',
                    to: 'facturacion@slc.com.gt', 
                    //to: 'forantes@slc.com.gt', //para ambiente de pruebas
                    //to: 'yenner.hernandez@tav.com.gt', //para ambiente de pruebas
                    subject: 'ERROR Notificación Sistema FEL '+DocNum,
                    html: htmlContent,
                    /*
                        attachments: [
                            {   // binary buffer as an attachment
                                filename: DocNum+'.pdf',
                                content: decodedData
                            }
                        ]
                    */
                };
                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        console.log("retornarPDF",error);
                    }
                })
            } else {
                 setTimeout(function() {
                    console.log(" - - - paso 1 - - - ")
                    retornar_anulacion(
                        obj['AnulaDocumentoXMLResponse']['uuid']['_text'], // uuid
                        obj['AnulaDocumentoXMLResponse']['xml_dte']['GTAnulacionDocumento']['SAT']['AnulacionDTE']['DatosGenerales']['_attrs']['IDReceptor'] // nit
                    )
                },1000)
            }
        })
    })
}

var retornar_anulacion = function(uuid, nit) { 
    console.log(" - - - paso 2 - - - ")
    var htmlContent = `Certificación de documento:`+DocNum+`, UUID: `+uuid+`, NIT: `+nit;
    var mailOptions = {
        from :'sistemas@geo.com.gt',
        to: 'facturacion@slc.com.gt', 
        //to: 'forantes@slc.com.gt', //para ambiente de pruebas
        //to: 'yenner.hernandez@tav.com.gt', //para ambiente de pruebas
        subject: 'Anulacion Notificación Sistema FEL '+DocNum,
        html: htmlContent,
        /*
        attachments: [
            {   // binary buffer as an attachment
                filename: DocNum+'.pdf',
                content: decodedData
            }
        ]
        */
    };
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log("retornar_anulacion",error);
        }
        var seriedocumento = uuid.split("-")
        var numerodocumento = seriedocumento[1]+seriedocumento[2]
        numerodocumento = parseInt(numerodocumento,16) 
        console.log(" - - - paso 3 - - - ")
        var respuesta_proceso = {
            seriedocumento: seriedocumento[0],
            numerodocumento: numerodocumento,
            uuid: uuid, 
            docnum: DocNum, 
            TipoDocumento: TipoDocumento,
            nit: nit,
            UUIdBase: UUIdBaseGlobal
        }
        to_table_fel_continue(respuesta_proceso)
    });
}

var enviar_a_certificador = function(factura_firmada) {
    var doc_id = "000000000000"+DocNum
    if(doc_id.length > 12) {
        doc_id = doc_id.substr((doc_id.length-12),doc_id.length)
    }
    var cadena = `<?xml version='1.0' encoding='UTF-8'?><RegistraDocumentoXMLRequest id="00000000-0000-0000-0000-`+doc_id+`"><xml_dte><![CDATA[`+ factura_firmada +` ]]></xml_dte></RegistraDocumentoXMLRequest>`

    console.log('enviar_a_certificador')
    console.log("cadena",cadena)
    console.log('= = = = = = = = = = = = = = = = = = = =')

    request.post({ 
        "headers": { 
            "content-type": "application/xml" ,
                "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJvcGVuaWQiXSwiZXhwIjoxNjk5NDE0MDE5LCJhdXRob3JpdGllcyI6WyJST0xFX0VNSVNPUiJdLCJqdGkiOiJlMjYwOWNjNS0xYTZmLTQzNzEtOTg4My05NWUzNzg3ZDk1MmIiLCJjbGllbnRfaWQiOiI4MTU3ODgxNCJ9.gVEmBk2gEg92ZQMVIo3uYx9aAY1b-LlPEttc3Dyf3xyFjdincvKV1gOah29KT4EtQDV-P_QvVV3SbC_C4E2yls-sbBZ3cziuOdxyVMEgX6VxVaCAIFn4AkDS2sFujKKRMScSwHLEhu7oZimoTBOIH034SyvV-e_tQyEcaaVJV6grZQF76kcoc-3YUcxzjF-jjH0gtXg4KwqRTJK9pIafdQn0sHdOXN3OJ5IuBMSKw49OGH4dvLgUpE75vQOyxMr7htrx3IO6lUe2sFDTz4hCzKu0FqqNORg0O5OZcXQik0YG1pdKJZsiPnJ5Gyu_2QkzIvn3I4IVLJDTJAlAshZN7g"
                //"Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJvcGVuaWQiXSwiZXhwIjoxNjc1NjUxNjQ3LCJhdXRob3JpdGllcyI6WyJST0xFX0VNSVNPUiJdLCJqdGkiOiI1MWJhODMzMC1kYWFmLTRhOGYtYWQwMS1hODI4NWE3MjMzNjgiLCJjbGllbnRfaWQiOiI4MTU3ODgxNCJ9.G-X8zE5k1PAWSvb31y1RYFyAQMoJxJPHlGj3spO24zndRK5zQFHVGI3grxQHAxfu0NdreDRFJSIS7o2NJO6YsftNygJMOj1NxKbPa5TnPEuEpjUUu8KTrBlDbKYxLhgU7Tblyh8TvsTWQDpWt0VeegrXEc35cJYswFM8jbk2OtoRUCu-ajda-ne-lgBCNCyZnkbScTkllAGHmTgObp6_qfksTOZ_jOhmbu1GEP8CGBf3J7RIdOBRgpPkHyYLBvCvdhz8X_AS55XHx1OaAuHPq3-0pmTi37nN5KP4u-jgjc2k1eEglIXgqiXd0gRqAS9nB5V9agCEBCjToNMGHuBNZQt
        }, 
        "url": "https://apiv2.ifacere-fel.com/api/registrarDocumentoXML", 
        //"url": "https://dev2.api.ifacere-fel.com/api/registrarDocumentoXML", //Para ambiente de pruebas de megaprint
        "body": cadena 
    },(error, response, body) => { 
        if(error) {
            console.log("enviar_a_certificador error", error)
        }
        body = body.replace(/&lt;/g,"<").replace(/&gt;/g,">")

        toJs(body, (err, obj) => {

            if(typeof obj['RegistraDocumentoXMLResponse']['uuid'] === 'undefined') {
                console.log("enviar_a_certificador error", err)
                var name_error = " "+Math.random() 
                var queryString_error = `INSERT INTO [dbo].[@FELE] ([Code] ,[Name] ,[U_UUID] ,[U_DocNum], [U_TipoDocumento], [U_DescError]) VALUES ('`+name_error+`', '`+name_error+`', '`+U_Name_Error+`', '`+U_DocNum_Error+`', '`+U_Error_TD+`', '`+body+`')`
                console.log("queryString_error",queryString_error)

                var pool = new sql.ConnectionPool(configSQL)
                pool.connect().then(_ => {
                    return pool.request().query(queryString_error)
                }).then(result => {
                    console.log("Error encontrado", U_Name_Error, U_UID_Error, U_DocNum_Error)
                    return 0
                });

                var htmlContent = `Reporte de error: `+U_Name_Error+' '+U_UID_Error+' '+U_DocNum_Error+'<br><pre>'+body+'</pre>';
                var mailOptions = {
                    from :'sistemas@geo.com.gt',
                    to: 'facturacion@slc.com.gt', 
                    //to: 'forantes@slc.com.gt', //para ambiente de pruebas
                    //to: 'yenner.hernandez@tav.com.gt', //para ambiente de pruebas
                    subject: 'ERROR Notificación Sistema FEL '+DocNum,
                    html: htmlContent,
                    /*
                        attachments: [
                            {   // binary buffer as an attachment
                                filename: DocNum+'.pdf',
                                content: decodedData
                            }
                        ]
                    */
                };
                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        console.log("retornarPDF",error);
                    }
                })

            } else {
                setTimeout(function() {
                    retornarPDF(
                        obj['RegistraDocumentoXMLResponse']['uuid']['_text'], // uuid
                        obj['RegistraDocumentoXMLResponse']['xml_dte']["GTDocumento"]["SAT"]["DTE"]["DatosEmision"]["Receptor"]['_attrs']['IDReceptor'] // nit
                    )
                },2000)
            }
        });
    });
}

var retornarPDF = function(uuid, nit) {
    var cadena = `<?xml version="1.0" encoding="UTF-8"?><RetornaPDFRequest><uuid>`+uuid+`</uuid></RetornaPDFRequest>`
    request.post({ 
        "headers": { 
            "content-type": "application/xml" ,
                "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJvcGVuaWQiXSwiZXhwIjoxNjk5NDE0MDE5LCJhdXRob3JpdGllcyI6WyJST0xFX0VNSVNPUiJdLCJqdGkiOiJlMjYwOWNjNS0xYTZmLTQzNzEtOTg4My05NWUzNzg3ZDk1MmIiLCJjbGllbnRfaWQiOiI4MTU3ODgxNCJ9.gVEmBk2gEg92ZQMVIo3uYx9aAY1b-LlPEttc3Dyf3xyFjdincvKV1gOah29KT4EtQDV-P_QvVV3SbC_C4E2yls-sbBZ3cziuOdxyVMEgX6VxVaCAIFn4AkDS2sFujKKRMScSwHLEhu7oZimoTBOIH034SyvV-e_tQyEcaaVJV6grZQF76kcoc-3YUcxzjF-jjH0gtXg4KwqRTJK9pIafdQn0sHdOXN3OJ5IuBMSKw49OGH4dvLgUpE75vQOyxMr7htrx3IO6lUe2sFDTz4hCzKu0FqqNORg0O5OZcXQik0YG1pdKJZsiPnJ5Gyu_2QkzIvn3I4IVLJDTJAlAshZN7g"
                //"Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJvcGVuaWQiXSwiZXhwIjoxNjc1NjUxNjQ3LCJhdXRob3JpdGllcyI6WyJST0xFX0VNSVNPUiJdLCJqdGkiOiI1MWJhODMzMC1kYWFmLTRhOGYtYWQwMS1hODI4NWE3MjMzNjgiLCJjbGllbnRfaWQiOiI4MTU3ODgxNCJ9.G-X8zE5k1PAWSvb31y1RYFyAQMoJxJPHlGj3spO24zndRK5zQFHVGI3grxQHAxfu0NdreDRFJSIS7o2NJO6YsftNygJMOj1NxKbPa5TnPEuEpjUUu8KTrBlDbKYxLhgU7Tblyh8TvsTWQDpWt0VeegrXEc35cJYswFM8jbk2OtoRUCu-ajda-ne-lgBCNCyZnkbScTkllAGHmTgObp6_qfksTOZ_jOhmbu1GEP8CGBf3J7RIdOBRgpPkHyYLBvCvdhz8X_AS55XHx1OaAuHPq3-0pmTi37nN5KP4u-jgjc2k1eEglIXgqiXd0gRqAS9nB5V9agCEBCjToNMGHuBNZQt
        }, 
        "url": "https://apiv2.ifacere-fel.com/api/retornarPDF", 
        //"url": "https://dev2.api.ifacere-fel.com/api/retornarPDF", //Para ambiente de pruebas megaprint
        "body": cadena 
    },(error, response, body) => { 
        if(error) { 
            console.log("retornarPDF error",error) 
        }
        try {
            body = body.split("<pdf>")
            body = body[1].split("</pdf>")
            body = body[0]
        } catch (e) {
            body = ""
        }
        let decodedData = Buffer.from(body, 'base64')
        var htmlContent = `Certificación de documento:`+DocNum+`, UUID: `+uuid+`, NIT: `+nit;
        var mailOptions = {
            from :'sistemas@geo.com.gt',
            to: 'facturacion@slc.com.gt', 
            //to: 'forantes@slc.com.gt', //para ambiente de pruebas
            //to: 'yenner.hernandez@tav.com.gt', //para ambiente de pruebas
            subject: 'Certificación Notificación Sistema FEL '+DocNum,
            html: htmlContent,
            attachments: [
                {   // binary buffer as an attachment
                    filename: DocNum+'.pdf',
                    content: decodedData
                }
            ]
        };
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log("retornarPDF",error);
            }
            var seriedocumento = uuid.split("-")
            var numerodocumento = seriedocumento[1]+seriedocumento[2]
            numerodocumento = parseInt(numerodocumento,16) 
            var respuesta_proceso = {
                seriedocumento: seriedocumento[0],
                numerodocumento: numerodocumento,
                uuid: uuid, 
                docnum: DocNum, 
                TipoDocumento: TipoDocumento,
                nit: nit
            }
            to_table_fel_continue(respuesta_proceso)
        });
    });
}

var nodos = []
var _totalimpuestos = 0
var _ischecked = []

var doc_TotalMontoImpuesto = 0
var doc_GranTotal = 0
var doc_items_TotalMontoImpuesto = 0
var doc_items_GranTotal = 0
var DocNum = "NA"
var TipoDocumento = "NA"

var appPort = 9292; 
var U_Name_Error = ""
var U_DocNum_Error = ""
var U_UID_Error = ""
var E_intentos = 0
var U_Error_TD = ""


setInterval(function() {
    DocNum_inicial = 0
    indice_actualizacion = 0
    U_Name_Error = ""
    U_DocNum_Error = ""
    U_UID_Error = ""
    U_Error_TD = ""
    console.log("inicio ciclo")
    listar_docnum()
},20000)
