import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientResolver } from './client.resolver';
import { NeedModule } from './need/need.module'; 
@Module({
    imports: [NeedModule],
    providers: [ClientService, ClientResolver],
    exports: [ClientService],
})
export class ClientModule {}