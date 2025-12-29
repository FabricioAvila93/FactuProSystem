CREATE DATABASE FactuProSystem  

USE FactuProSystem

CREATE TABLE Fps_Usuarios(
    IdUsuario INT PRIMARY KEY IDENTITY(1,1),
	CodigoUsuario NVARCHAR(20),
	Clave NVARCHAR(200),
    Identificacion NVARCHAR(20) NOT NULL,
    NombreCompleto NVARCHAR(50) NOT NULL,
    EsMasculino BIT NOT NULL DEFAULT 1,
    Direccion NVARCHAR(50) NULL,
    Telefono NVARCHAR(50) NULL,
    Correo NVARCHAR(50) NULL,
    IdRol INT NOT NULL,
    IdAgencia INT NOT NULL,
    FechaRegistro DATETIME NOT NULL DEFAULT GETDATE(),
    UsuarioRegistro NVARCHAR(50) NOT NULL, 
    FechaModificacion DATETIME NULL,
    UsuarioModificacion NVARCHAR(50) NULL,
    EstaActivo BIT NOT NULL DEFAULT 1,

    CONSTRAINT FK_Usuarios_Roles FOREIGN KEY (IdRol) REFERENCES Roles(IdRol),
    CONSTRAINT FK_Usuarios_Agencias FOREIGN KEY (IdAgencia) REFERENCES Agencias(IdAgencia)
);


CREATE TABLE Fps_Agencias (
    IdAgencia INT PRIMARY KEY IDENTITY(1,1),
    CodigoAgencia NVARCHAR(10) NOT NULL,
    NombreAgencia NVARCHAR(100) NOT NULL,
    EstaActivo BIT NOT NULL DEFAULT 1,
);


CREATE TABLE Fps_Roles (
    IdRol INT PRIMARY KEY IDENTITY(1,1),
    CodigoRol VARCHAR(5) NOT NULL,
    Nombre NVARCHAR(50) NOT NULL,
    EstaActivo BIT NOT NULL DEFAULT 1,

    CONSTRAINT UQ_Roles_CodigoRol UNIQUE (CodigoRol),
    CONSTRAINT UQ_Roles_Nombre UNIQUE (Nombre)
);


CREATE TABLE Fps_UsuariosLoginEstado (
    IdEstadoLogin INT IDENTITY(1,1) PRIMARY KEY,
    IdUsuario INT NOT NULL UNIQUE,
    IntentosFallidos INT NOT NULL DEFAULT 0,
    EstaBloqueado BIT NOT NULL DEFAULT 0,
    BloqueadoHasta DATETIME NULL,
    DebeCambiarClave BIT NOT NULL DEFAULT 1,
    FechaUltimoLogin DATETIME NULL,
    CONSTRAINT FK_UsuariosLoginEstado_Usuarios FOREIGN KEY (IdUsuario) REFERENCES Fps_Usuarios(IdUsuario)
);




CREATE TABLE Fps_Proveedor (
    IdProveedor  INT IDENTITY(1,1) NOT NULL,
    RTNProveedor VARCHAR(20) NULL,
    NombreProveedor VARCHAR(100) NULL,
    Direccion NVARCHAR(255) NULL,
    Correo NVARCHAR(100) NULL,
    Telefono NVARCHAR(20) NULL,
    FechaRegistro DATETIME NULL,
    UsuarioRegistro NVARCHAR(50) NULL,
    FechaModificacion DATETIME NULL,
    UsuarioModificacion NVARCHAR(50) NULL,
	EstaActivo BIT NOT NULL DEFAULT 1

);


CREATE TABLE Fps_ProveedorCaiRango (
	IdRangoCAI int IDENTITY(1,1) NOT NULL PRIMARY KEY,
	IdProveedor int NOT NULL,
	CAI varchar(50) NOT NULL,
	CodigoEstablecimiento varchar(3) NOT NULL,
	PuntoEmision varchar(3) NOT NULL,
	TipoDocumento varchar(2) NOT NULL,
	CorrelativoInicio varchar(8) NOT NULL,
	CorrelativoFin varchar(8) NOT NULL,
	DocumentoFiscal_Inicio varchar(50) NULL,
	DocumentoFiscal_Fin varchar(50) NULL,
	FechaRegistro datetime NOT NULL DEFAULT(GETDATE()),
	UsuarioRegistro nvarchar(50) NULL,
	FechaModificacion datetime NULL,
	UsuarioModificacion nvarchar(50) NULL,
	EstaActivo bit NOT NULL DEFAULT(1)
	
)

ALTER TABLE Fps_Proveedor
ADD CONSTRAINT PK_Fps_Proveedor PRIMARY KEY (IdProveedor);


ALTER TABLE Fps_ProveedorCaiRango
ADD CONSTRAINT FK_ProveedorCaiRango_Proveedor
FOREIGN KEY (IdProveedor)
REFERENCES Fps_Proveedor (IdProveedor);


USE FactuProSystem;
GO

-- Tabla Documento
CREATE TABLE Fps_Documento (
    IdDocumento INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Codigo VARCHAR(10) NOT NULL,
    Nombre VARCHAR(100) NOT NULL
);
GO

-- Tabla EstadosFactura
CREATE TABLE Fps_EstadosFactura (
    IdEstado INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Nombre NVARCHAR(20) NOT NULL
);
GO

-- Tabla Facturas
CREATE TABLE Fps_Facturas (
    IdFactura INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Fecha DATETIME NOT NULL,
    Establecimiento VARCHAR(5) NULL,
    PuntoEmision VARCHAR(5) NULL,
    TipoDocumento VARCHAR(5) NULL,
    Correlativo VARCHAR(20) NULL,
    CAI VARCHAR(50) NULL,
	UsuarioRegistro varchar(50) not null,
    FechaRegistro DATETIME NULL,
	UsuarioModificacion varchar(50) null,
    FechaActualizacion DATETIME NULL,
    IdDocumento INT NOT NULL,
    NumeroDocumentoRecibo VARCHAR(20) NULL,
    KilometrajeRecorrido DECIMAL(10,2) NULL,
    EsGasolina BIT NOT NULL,
    ComentarioAdmin NVARCHAR(MAX) NULL,
    FechaContable DATETIME NULL,
	IdUsuario INT NOT NULL,
    IdEstado INT NULL,
    IdProveedor INT NOT NULL,
    IdUsuarioModifica INT NULL,
	EstaActivo BIT default 1,
    CONSTRAINT FK_Facturas_Documento FOREIGN KEY (IdDocumento) REFERENCES Fps_Documento(IdDocumento),
    CONSTRAINT FK_Facturas_EstadosFactura FOREIGN KEY (IdEstado) REFERENCES Fps_EstadosFactura(IdEstado)
    -- Agrega más FK si tienes tablas de Usuarios, Proveedores, etc.
);
GO

-- Tabla MontosFactura
CREATE TABLE Fps_MontosFactura (
    IdMontosFactura INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    IdFactura INT NOT NULL,
    Exentas DECIMAL(18,2) NULL,
    Grav15 DECIMAL(18,2) NULL,
    Grav18 DECIMAL(18,2) NULL,
    Impuesto15 DECIMAL(18,2) NULL,
    Impuesto18 DECIMAL(18,2) NULL,
    TotalCompra DECIMAL(18,2) NOT NULL,
    CONSTRAINT FK_MontosFactura_Facturas FOREIGN KEY (IdFactura) REFERENCES Fps_Facturas(IdFactura)
);
GO


ALTER TABLE Fps_EstadosFactura
ALTER COLUMN Nombre VARCHAR(30);


select * from Fps_ProveedorCaiRango

EXEC sp_help 'Fps_Facturas'
-- o
SELECT COLUMN_NAME, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Fps_Facturas';


-- Primero eliminar la tabla existente si vas a recrearla:
DROP TABLE IF EXISTS Fps_MontosFactura;
GO

-- Crear la tabla con IdFactura como PK y FK:
CREATE TABLE Fps_MontosFactura (
    IdFactura INT NOT NULL PRIMARY KEY,
    Exentas DECIMAL(18,2) NULL,
    Grav15 DECIMAL(18,2) NULL,
    Grav18 DECIMAL(18,2) NULL,
    Impuesto15 DECIMAL(18,2) NULL,
    Impuesto18 DECIMAL(18,2) NULL,
    TotalCompra DECIMAL(18,2) NOT NULL,
    CONSTRAINT FK_MontosFactura_Facturas FOREIGN KEY (IdFactura) REFERENCES Fps_Facturas(IdFactura)
);
GO
