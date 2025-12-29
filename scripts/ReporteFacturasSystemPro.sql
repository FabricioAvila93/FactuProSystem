SELECT 
    p.RTNProveedor,
    d.Nombre AS ClaseDocumento,
    f.CAI,
    CASE 
        WHEN d.Codigo = 'OC' THEN NULL
        ELSE CONCAT(f.Establecimiento, '-', f.PuntoEmision, '-', f.TipoDocumento, '-', f.Correlativo)
    END AS DocumentoCompleto,
    f.NumeroDocumentoRecibo,
    CONVERT(DATE, f.FechaRegistro) AS FechaRegistro,
    CONVERT(DATE, fe.FechaContable) AS FechaContable,
    mf.Exentas,
    mf.Impuesto15,
    mf.Impuesto18,
    mf.TotalCompra
FROM Fps_Facturas f
INNER JOIN Fps_Proveedor p ON p.IdProveedor = f.IdProveedor
INNER JOIN Fps_Documento d ON d.IdDocumento = f.IdDocumento
INNER JOIN (
    SELECT IdFactura,
           SUM(Exentas) AS Exentas,
           SUM(Impuesto15) AS Impuesto15,
           SUM(Impuesto18) AS Impuesto18,
           SUM(TotalCompra) AS TotalCompra
    FROM Fps_MontosFactura
    GROUP BY IdFactura
) mf ON mf.IdFactura = f.IdFactura
INNER JOIN (
    SELECT IdFactura, MAX(FechaContable) AS FechaContable
    FROM Fps_FacturaEvaluacion
    GROUP BY IdFactura
) fe ON fe.IdFactura = f.IdFactura
order by FechaRegistro asc   