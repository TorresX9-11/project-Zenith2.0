import React, { useEffect } from 'react';
import { Clock, Target, Users } from 'lucide-react';

const DEFAULT_PROFILE_IMAGE = "/src/pages/assetsImg/imgPerfil/default/defaultProfile.svg";

interface TeamMember {
  name: string;
  role: string;
  description: string;
  imageUrl?: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Gabriel Ramirez",
    role: "Diseñador UI/UX y Frontend",
    description: "Creativo y detallista, enfocado en la estética y funcionalidad lógica de la aplicación.",
    imageUrl: "/src/pages/assetsImg/imgPerfil/GabrielRamirez/imgPerfil.jpg"
  },
  {
    name: "Leandro Diaz",
    role: "Desarrollador Frontend",
    description: "Implementa interfaces limpias y accesibles, priorizando rendimiento y buenas prácticas.",
    imageUrl: undefined
  },
  {
    name: "Oscar Cariaga",
    role: "Desarrollador Backend",
    description: "Diseña y mantiene servicios robustos y escalables, cuidando la seguridad y la calidad.",
    imageUrl: undefined
  },
  {
    name: "Emanuel Torres",
    role: "Desarrollador Backend",
    description: "Apasionado por la optimización de procesos y la creación de APIs eficientes.",
    imageUrl: "/src/pages/assetsImg/imgPerfil/EmanuelTorres/imgPerfil.jpg"
  },
  {
    name: "John Alvarez",
    role: "Desarrollador Frontend",
    description: "Especialista en crear experiencias de usuario intuitivas y atractivas.",
    imageUrl: "/src/pages/assetsImg/imgPerfil/JohnAlvarez/imgPerfil.jpg"
  }
];

const AboutUs: React.FC = () => {
  // Scroll al inicio al entrar
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl p-8 mb-10">
        <h1 className="text-3xl font-bold text-center mb-2">Sobre Nosotros</h1>
        <p className="text-sm text-center text-primary-100">Creemos en aprovechar el tiempo al máximo, sacale el máximo provecho a tu día</p>
      </div>
      
      {/* Sección 1: Nuestra Misión (arriba) */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Target className="text-primary-600" size={24} />
          <span>Nuestra Misión</span>
        </h2>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <p className="text-base text-neutral-700">
          Nuestra misión es entregarle a los estudiantes universitarios 
          herramientas inteligentes y sencillas que los ayuden a aprovechar al 
          máximo su tiempo, energía y potencial académico, mientras fomentan 
          un estilo de vida equilibrado y saludable. 
          Queremos que estudiar y organizarse sea más sencillo, efectivo y 
          hasta divertido, para que cada día puedan avanzar hacia sus metas 
          sin descuidar su bienestar.
          </p>
        </div>
      </section>

      {/* Sección 2: Nuestra Historia (abajo) */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="text-primary-600" size={24} />
          <span>Nuestra Historia</span>
        </h2>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <p className="text-base mb-3 text-neutral-700">
          Zenith nació en mayo de 2024 gracias a la visión de un grupo de estudiantes universitarios que vivieron 
          de primera mano lo difícil que es equilibrar la vida académica con otras 
          responsabilidades y actividades importantes. Sabemos que el tiempo es un 
          recurso valioso y que cada minuto cuenta, por eso desarrollamos una 
          herramienta pensada para ayudarte a organizar tu día de manera sencilla y efectiva.
          </p>
          <p className="text-base mb-0 text-neutral-700">
          Con Zenith, podrás planificar tu estudio, incorporar hábitos de 
          ejercicio y asegurar momentos de descanso, promoviendo un 
          equilibrio saludable que te permita avanzar en tus metas sin 
          descuidar tu bienestar.
          </p>
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Users className="text-primary-600" size={24} />
          <span>Nuestro Equipo</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="w-24 h-24 mx-auto mb-4 relative">
                <img
                  src={member.imageUrl || DEFAULT_PROFILE_IMAGE}
                  alt={`Foto de ${member.name}`}
                  className="w-full h-full rounded-full object-cover border border-neutral-200"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_PROFILE_IMAGE;
                  }}
                />
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">{member.name}</h3>
              <p className="text-center text-neutral-600 mb-2">{member.role}</p>
              <p className="text-center text-sm text-neutral-500">
                {member.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
