using FactuProSystem.Api.Custom;
using FactuProSystem.Api.Data;
using Microsoft.EntityFrameworkCore;
    
var builder = WebApplication.CreateBuilder(args);

// Configurar EF Core
builder.Services.AddDbContext<FactuProSystemContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("CadenaSQL")));

builder.Services.AddSingleton<Fps_Utilidades>();

//Agregar CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirAngular",
         policy =>
         {
             policy
               .WithOrigins("http://localhost:4200", "http://192.168.1.179:4200")
            //  .WithOrigins("http://localhost:4200")
             .AllowAnyHeader()
             .AllowAnyMethod();
         });
});

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
//builder.Services.AddOpenApi();

try
{
    var app = builder.Build();

    // Configure the HTTP request pipeline.
    if (app.Environment.IsDevelopment())
    {
        //app.MapOpenApi();
        app.UseDeveloperExceptionPage();
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    // USAR CORS ANTES de cualquier middleware que procese peticiones
    app.UseCors("PermitirAngular");

    app.UseAuthorization();

    app.MapControllers();

    app.Run();
}
catch (Exception ex)
{
    // Attempt to log using a simple LoggerFactory (falls back to console if logging infrastructure isn't available)
    Console.WriteLine("Application terminated unexpectedly: " + ex.Message);

    // Rethrow so the process exits with failure and the exception is visible to any host tools
    throw;
}
